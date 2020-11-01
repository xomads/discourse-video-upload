import { getOwner } from "discourse-common/lib/get-owner";
import ModalFunctionality from "discourse/mixins/modal-functionality";

const validExtensions = ["video/mp4", "video/mov", "video/wmv", "video/avi", "video/flv"];
const STATUS_POLLING_INTERVAL_MILLIS = 10000;

export default Ember.Controller.extend(ModalFunctionality, {
    uploadProgress: 0,
    isUploading: false,
    isProcessing: false,
    defaultPrivacy: 'unlisted',
    vimeoEnabled: false,
    youtubeEnabled: false,

    init() {
        this._super(...arguments);
        this.vimeoEnabled = this.siteSettings.vimeo_upload_enabled;
        this.youtubeEnabled = this.siteSettings.youtube_upload_enabled;
        const component = this;
        setTimeout(() => $("#video-file").change(() => component.validateVideoFile(component)), 1000);
    },
    validateVideoFile(component) {
        const file = $("#video-file").prop('files');
        if (!file || file.length < 1) return false;
        if (!file[0].type.startsWith('video/')) {
            alert("Invalid video file");
            return false;
        }

        $("#video-title").val(file[0].name);
        $("#video-scope").val("unlisted");
        $("#video-description").val('by @' + component.currentUser.username)

        return true;
    },
    updateProgress(data, component) {
        const progress = Math.floor(data.loaded / data.total * 100)
        component.set('uploadProgress', progress);
    },
    actions: {
        vimeoUpload() {
            const file = $("#video-file").prop('files');
            const composer = getOwner(this).lookup("controller:composer");
            const component = this;
            component.setProperties({
                isUploading: true,
                uploadProgress: 0,
                isProcessing: false,
                processingError: false
            });

            $("#vimeo-upload-btn").attr('disabled', 'disabled');

            let uploadUrl = '';

            const uploadInst = new VimeoUpload({
                file: file[0],
                token: this.siteSettings.vimeo_api_access_token,
                name: $("#video-title").val(),
                description: $("#video-description").val(),
                view: this.siteSettings.vimeo_default_view_privacy,
                embed: this.siteSettings.vimeo_default_embed_privacy,
                upgrade_to_1080: true,
                onError: function(data) {
                    console.error('<strong>Error</strong>: ' + JSON.parse(data).error, 'danger')
                },
                onProgress: data => component.updateProgress(data, component),
                onComplete: function(videoId, index) {
                    component.setProperties({
                        uploadProgress: 0,
                        isUploading: false,
                        isProcessing: true,
                    });
                    uploadUrl = 'https://vimeo.com/' + videoId;
                    component.vimeoUploadStatus(uploadInst, uploadUrl, composer, component);
                }
            });

            uploadInst.upload();
        },
        youtubeUpload() {
            const component = this;
            component.setProperties({
                isAuthing: true,
                isUploading: false,
                uploadProgress: 0,
                isProcessing: false,
                processingError: false
            });

            const checkScopeAndUpload = function () {
                const authResponse = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse();
                if (authResponse.scope.indexOf(ytScopes[0]) >= 0 && authResponse.scope.indexOf(ytScopes[1]) >= 0) {
                    component.sendFileToYoutube()
                    return true;
                }
                return false;
            }

            const ytScopes = ['https://www.googleapis.com/auth/youtube', 'https://www.googleapis.com/auth/youtube.readonly'];
            gapi.load('client:auth2', function () {
                gapi.client.init({
                    clientId: component.siteSettings.youtube_api_client_id,
                    scope: ytScopes.join(' ')
                }).then(function () {
                    if (!(gapi.auth2.getAuthInstance().isSignedIn.get() && checkScopeAndUpload()))
                        gapi.auth2.getAuthInstance().signIn().then(checkScopeAndUpload)
                })
            });
        }
    },
    sendFileToYoutube() {
        const accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
        const component = this;
        const file = $("#video-file").prop('files');
        $("#youtube-upload-btn").attr('disabled', 'disabled');

        component.setProperties({
            isUploading: true,
            isAuthing: false
        });

        const metadata = {
            snippet: {
                title: $("#video-title").val(),
                description: $("#video-description").val()
            },
            status: {
                privacyStatus: $("#video-scope").val()
            }
        };
        const uploader = new MediaUploader({
            baseUrl: 'https://www.googleapis.com/upload/youtube/v3/videos',
            file: file[0],
            token: accessToken,
            metadata: metadata,
            params: {
                part: Object.keys(metadata).join(',')
            },
            onError: function(data) {
                let message = data;
                // Assuming the error is raised by the YouTube API, data will be
                // a JSON string with error.message set. That may not be the
                // only time onError will be raised, though.
                try {
                    const errorResponse = JSON.parse(data);
                    message = errorResponse.error.message;
                } finally {
                    console.error(message);
                }
            }.bind(this),
            onProgress: function(data) { component.updateProgress(data, component) }.bind(this),
            onComplete: function(data) {
                const uploadResponse = JSON.parse(data);
                component.ytVideoId = uploadResponse.id;

                component.setProperties({
                    uploadProgress: 0,
                    isUploading: false,
                    isProcessing: true,
                });
                $("#youtube-upload-btn").removeAttr('disabled');
                component.youtubeUploadStatus();
            }.bind(this)
        });
        uploader.upload();
    },
    youtubeUploadStatus() {
        const composer = getOwner(this).lookup("controller:composer");
        const component = this;
        gapi.client.request({
            path: '/youtube/v3/videos',
            params: {
                part: 'status,player',
                id: component.ytVideoId
            },
            callback: function (response) {
                if (response.error) {
                    // The status polling failed.
                    console.log(response.error.message);
                    setTimeout(component.youtubeUploadStatus().bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                } else {
                    var uploadStatus = response.items[0].status.uploadStatus;
                    switch (uploadStatus) {
                        case 'uploaded':
                            setTimeout(component.youtubeUploadStatus.bind(this), STATUS_POLLING_INTERVAL_MILLIS);
                            break;
                        case 'processed':
                            component.set('isProcessing', false);
                            composer.model.appEvents.trigger("composer:insert-block", '\nhttps://youtu.be/' + component.ytVideoId + '\n');
                            component.send('closeModal');
                            break;
                        // All other statuses indicate a permanent transcoding failure.
                        default:
                            component.set('processingError', true);
                            component.set('isProcessing', false);
                            break;
                    }
                }
            }.bind(this)
        });
    },
    vimeoUploadStatus(uploadInst, uploadUrl, composer, component) {
        const interval = setInterval(function () {
            uploadInst.transcodeStatus(function (status) {
                if (status === 'in_progress') return ;
                clearInterval(interval);
                component.set('isProcessing', false);
                $("#vimeo-upload-btn").removeAttr('disabled');
                if (status === 'error') component.set('processingError', true);
                else if (status === 'complete') {
                    composer.model.appEvents.trigger("composer:insert-block", '\n' + uploadUrl + '\n');
                    component.send('closeModal');
                }
            }, function (error) {
                clearInterval(interval);
                component.setProperties({
                    isProcessing: false,
                    processingError: true
                });
            })
        }, STATUS_POLLING_INTERVAL_MILLIS);
    }
});

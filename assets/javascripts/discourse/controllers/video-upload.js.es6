import { getOwner } from "discourse-common/lib/get-owner";
import ModalFunctionality from "discourse/mixins/modal-functionality";

const validExtensions = ["video/mp4", "video/mov", "video/wmv", "video/avi", "video/flv"];
const STATUS_POLLING_INTERVAL_MILLIS = 10000;

export default Ember.Controller.extend(ModalFunctionality, {
    uploadProgress: 0,
    isUploading: false,
    isProcessing: false,

    init(a, component) {
        this._super(...arguments);
    },
    actions: {
        vimeoUpload() {
            const composer = getOwner(this).lookup("controller:composer");
            const file = $("#video-file").prop('files');
            if (!file || file.length < 1) return;
            if (!validExtensions.includes(file[0].type)) alert("Invalid video, supported types are mp4, mov, wmv, avi, flv");

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
                name: file[0].name,
                file: file[0],
                token: this.siteSettings.vimeo_api_access_token,
                view: this.siteSettings.vimeo_default_view_privacy,
                embed: this.siteSettings.vimeo_default_embed_privacy,
                description: 'by @' + this.currentUser.username,
                upgrade_to_1080: true,
                onError: function(data) {
                    console.error('<strong>Error</strong>: ' + JSON.parse(data).error, 'danger')
                },
                onProgress: function(data) {
                    const progress = Math.floor(data.loaded / data.total * 100)
                    component.set('uploadProgress', progress);
                },
                onComplete: function(videoId, index) {
                    component.setProperties({
                        uploadProgress: 0,
                        isUploading: false,
                        isProcessing: true,
                    });
                    uploadUrl = 'https://vimeo.com/' + videoId;
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

            uploadInst.upload();
        },
        youtubeUpload() {
            const file = $("#video-file").prop('files');
            if (!file || file.length < 1) return;
            if (!validExtensions.includes(file[0].type)) alert("Invalid video, supported types are mp4, mov, wmv, avi, flv");

            const component = this;
            component.setProperties({
                isAuthing: true,
                isUploading: false,
                uploadProgress: 0,
                isProcessing: false,
                processingError: false
            });

            gapi.load('client:auth2', function () {
                gapi.client.init({
                    clientId: component.siteSettings.youtube_api_client_id,
                    scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly'
                }).then(function () {
                    let accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
                    if (!accessToken) {
                        gapi.auth2.getAuthInstance().signIn().then(function (res) {
                            accessToken = gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token;
                            component.sendFileToYoutube(accessToken);
                        });
                    } else {
                        component.sendFileToYoutube(accessToken);
                    }
                })
            });
        }
    },
    sendFileToYoutube(accessToken) {
        const component = this;
        const file = $("#video-file").prop('files');

        $("#youtube-upload-btn").attr('disabled', 'disabled');
        component.setProperties({
            isUploading: true,
            isAuthing: false
        });

        const metadata = {
            snippet: {
                title: file[0].name,
                description:  'by @' + component.currentUser.username
            },
            status: {
                privacyStatus: component.siteSettings.youtube_default_view_privacy
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
            onProgress: function(data) {
                const progress = Math.floor(data.loaded / data.total * 100)
                component.set('uploadProgress', progress);
            }.bind(this),
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
    }
});

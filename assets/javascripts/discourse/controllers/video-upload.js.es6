import { getOwner } from "discourse-common/lib/get-owner";
import ModalFunctionality from "discourse/mixins/modal-functionality";

const validExtensions = ["video/mp4", "video/mov", "video/wmv", "video/avi", "video/flv"];

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
                                $("#discourse-modal .close").click();
                            }
                        }, function (error) {
                            clearInterval(interval);
                            component.setProperties({
                                isProcessing: false,
                                processingError: true
                            });
                        })
                    }, 10000);
                }
            });

            uploadInst.upload();
        }
    }
});

import { getOwner } from "discourse-common/lib/get-owner";

const validExtensions = ["video/mp4", "video/mov", "video/wmv", "video/avi", "video/flv"];

export default {
    setupComponent(a, component) {
        component.setProperties({
            uploadProgress: 0,
            isUploading: false,
            isProcessing: false
        });
    },
    actions: {
        vimeoUpload() {
            const composer = getOwner(this).lookup("controller:composer");
            const file = $("#filename-input").prop('files');
            if (!file || file.length < 1) return;
            if (!validExtensions.includes(file[0].type)) alert("Invalid video, supported types are mp4, mov, wmv, avi, flv");

            const component = this;
            component.set('isUploading', true);
            let uploadUrl = '';

            const uploadInst = new VimeoUpload({
                name: file[0].name,
                file: file[0],
                token: this.siteSettings.vimeo_api_access_token,
                view: this.siteSettings.vimeo_default_view_privacy,
                embed: this.siteSettings.vimeo_default_embed_privacy,
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
                        isProcessing: true
                    });
                    uploadUrl = 'https://vimeo.com/' + videoId;
                    const interval = setInterval(function () {
                        uploadInst.transcodeStatus(function (status) {
                            if (status === 'in_progress') return ;
                            clearInterval(interval);
                            component.set('isProcessing', false);
                            if (status === 'error') component.set('processingError', true);
                            else if (status === 'complete') {
                                composer.model.appEvents.trigger("composer:insert-block", '\n' + uploadUrl + '\n');
                                $("#discourse-modal .close").click();
                            }
                        })
                    }, 10000);
                }
            });

            uploadInst.upload();
        }
    }
};

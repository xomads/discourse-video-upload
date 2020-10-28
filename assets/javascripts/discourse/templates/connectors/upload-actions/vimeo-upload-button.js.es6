export default {
    actions: {
        vimeoUpload() {
            const file = $("#filename-input").prop('files');
            console.log(file[0]);
            if (!file || file.length < 1) return;

            const updateProgress = function(progress) {
                progress = Math.floor(progress * 100)
                const element = document.getElementById('progress')
                element.setAttribute('style', 'width:' + progress + '%')
                element.innerHTML = '&nbsp;' + progress + '%'
            };

            (new VimeoUpload({
                name: file[0].name,
                file: file[0],
                token: this.siteSettings.vimeo_api_access_token,
                upgrade_to_1080: true,
                onError: function(data) {
                    console.error('<strong>Error</strong>: ' + JSON.parse(data).error, 'danger')
                },
                onProgress: function(data) {
                    // updateProgress(data.loaded / data.total)
                    console.log(data.loaded / data.total * 100)
                },
                onComplete: function(videoId, index) {
                    let url = 'https://vimeo.com/' + videoId

                    if (index > -1) {
                        /* The metadata contains all of the uploaded video(s) details see: https://developer.vimeo.com/api/endpoints/videos#/{video_id} */
                        url = this.metadata[index].link //

                        /* add stringify the json object for displaying in a text area */
                        const pretty = JSON.stringify(this.metadata[index], null, 2)

                        console.log(pretty) /* echo server data */
                    }

                    console.log('<strong>Upload Successful</strong>: check uploaded video @ <a href="' + url + '">' + url + '</a>. Open the Console for the response details.')
                }
            })).upload()
        }
    }
};

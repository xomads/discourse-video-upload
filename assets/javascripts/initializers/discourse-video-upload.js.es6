import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

function initializeDiscourseVideoUpload(api) {
  // https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/lib/plugin-api.js.es6
  const composerController = api.container.lookup("controller:composer");

  if (composerController.siteSettings.youtube_upload_enabled || composerController.siteSettings.vimeo_upload_enabled) {
    api.modifyClass("component:d-editor", {
      actions: {
        openVideoUploadModal() {
          showModal("video-upload");
        }
      }
    });

    api.onToolbarCreate(tb => {
      tb.addButton({
        id: 'video-upload',
        group: 'insertions',
        icon: 'video',
        sendAction: () => tb.context.send('openVideoUploadModal'),
        title: 'video_upload'
      })
    });
  }

}

export default {
  name: "discourse-video-upload",

  initialize() {
    withPluginApi("0.8.31", initializeDiscourseVideoUpload);
  }
};

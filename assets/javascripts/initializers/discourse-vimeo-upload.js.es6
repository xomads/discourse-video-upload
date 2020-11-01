import { withPluginApi } from "discourse/lib/plugin-api";
import showModal from "discourse/lib/show-modal";

function initializeDiscourseVimeoUpload(api) {
  // https://github.com/discourse/discourse/blob/master/app/assets/javascripts/discourse/lib/plugin-api.js.es6
  const composerController = api.container.lookup("controller:composer");

  api.modifyClass("component:d-editor", {
    actions: {
      openVideoUploadModal() {
        showModal("video-upload");
      }
    }
  });

  api.onToolbarCreate(tb => {
    tb.addButton({
      id: 'vimeo-upload',
      group: 'extras',
      icon: 'fab-vimeo-v',
      sendAction: () => tb.context.send('openVideoUploadModal'),
      title: 'upload-vimeo'
    })
  });
}

export default {
  name: "discourse-vimeo-upload",

  initialize() {
    withPluginApi("0.8.31", initializeDiscourseVimeoUpload);
  }
};

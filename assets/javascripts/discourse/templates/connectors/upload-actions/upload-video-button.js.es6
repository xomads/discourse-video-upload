import { getOwner } from "discourse-common/lib/get-owner";
import showModal from "discourse/lib/show-modal";

export default {
    actions: {
        videoUpload() {
            const composer = getOwner(this).lookup("controller:composer");
            composer.send('closeModal');
            showModal("video-upload");
        }
    }
}
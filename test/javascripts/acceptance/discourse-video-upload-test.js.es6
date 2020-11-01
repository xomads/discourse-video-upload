import { acceptance } from "helpers/qunit-helpers";

acceptance("DiscourseVideoUpload", { loggedIn: true });

test("DiscourseVideoUpload works", async assert => {
  await visit("/admin/plugins/discourse-video-upload");

  assert.ok(false, "it shows the DiscourseVideoUpload button");
});

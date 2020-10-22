import { acceptance } from "helpers/qunit-helpers";

acceptance("DiscourseVimeoUpload", { loggedIn: true });

test("DiscourseVimeoUpload works", async assert => {
  await visit("/admin/plugins/discourse-vimeo-upload");

  assert.ok(false, "it shows the DiscourseVimeoUpload button");
});

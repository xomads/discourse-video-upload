export default function() {
  this.route("discourse-vimeo-upload", function() {
    this.route("actions", function() {
      this.route("show", { path: "/:id" });
    });
  });
};

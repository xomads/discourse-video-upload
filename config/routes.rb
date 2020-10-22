require_dependency "discourse_vimeo_upload_constraint"

DiscourseVimeoUpload::Engine.routes.draw do
  get "/" => "discourse_vimeo_upload#index", constraints: DiscourseVimeoUploadConstraint.new
  get "/actions" => "actions#index", constraints: DiscourseVimeoUploadConstraint.new
  get "/actions/:id" => "actions#show", constraints: DiscourseVimeoUploadConstraint.new
end

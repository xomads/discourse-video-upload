require_dependency "discourse_video_upload_constraint"

DiscourseVideoUpload::Engine.routes.draw do
  get "/" => "discourse_video_upload#index", constraints: DiscourseVideoUploadConstraint.new
  get "/actions" => "actions#index", constraints: DiscourseVideoUploadConstraint.new
  get "/actions/:id" => "actions#show", constraints: DiscourseVideoUploadConstraint.new
end

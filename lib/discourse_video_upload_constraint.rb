class DiscourseVideoUploadConstraint
  def matches?(request)
    SiteSetting.discourse_video_upload_enabled
  end
end

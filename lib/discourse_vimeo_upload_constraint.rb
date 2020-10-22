class DiscourseVimeoUploadConstraint
  def matches?(request)
    SiteSetting.discourse_vimeo_upload_enabled
  end
end

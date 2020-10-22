module DiscourseVimeoUpload
  class DiscourseVimeoUploadController < ::ApplicationController
    requires_plugin DiscourseVimeoUpload

    before_action :ensure_logged_in

    def index
    end
  end
end

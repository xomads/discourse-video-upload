module DiscourseVideoUpload
  class Engine < ::Rails::Engine
    engine_name "DiscourseVideoUpload".freeze
    isolate_namespace DiscourseVideoUpload

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::DiscourseVideoUpload::Engine, at: "/discourse-video-upload"
      end
    end
  end
end

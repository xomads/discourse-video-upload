module DiscourseVimeoUpload
  class Engine < ::Rails::Engine
    engine_name "DiscourseVimeoUpload".freeze
    isolate_namespace DiscourseVimeoUpload

    config.after_initialize do
      Discourse::Application.routes.append do
        mount ::DiscourseVimeoUpload::Engine, at: "/discourse-vimeo-upload"
      end
    end
  end
end

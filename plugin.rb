# frozen_string_literal: true

# name: DiscourseVimeoUpload
# about: Upload videos to Vimeo from Discourse composer
# version: 0.1
# authors: ti0
# url: https://github.com/xomads/discourse-vimeo-upload

register_asset 'stylesheets/common/discourse-vimeo-upload.scss'
register_asset 'stylesheets/desktop/discourse-vimeo-upload.scss', :desktop
register_asset 'stylesheets/mobile/discourse-vimeo-upload.scss', :mobile

enabled_site_setting :discourse_vimeo_upload_enabled

PLUGIN_NAME ||= 'DiscourseVimeoUpload'

load File.expand_path('lib/discourse-vimeo-upload/engine.rb', __dir__)

after_initialize do
  # https://github.com/discourse/discourse/blob/master/lib/plugin/instance.rb
end

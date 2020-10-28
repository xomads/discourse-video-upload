# Discourse Vimeo Upload Plugin

Allows users on a Discourse forum to upload videos to a single Vimeo account.
Once you setup the plugin with the steps below, <b>all community users will be able to upload videos to *your Vimeo account*.</b>
You are responsible for limits and usage of your Vimeo account. 

You can watch a demo of the plugin here:
https://vimeo.com/473102487

## Plugin Setup

- Your Discourse must be updated to include this commit on 28-Oct-2020 as the plugin depends on this code: https://github.com/discourse/discourse/pull/11052

- Follow the directions at [Install a Plugin](https://meta.discourse.org/t/install-a-plugin/19157) using `https://github.com/xomads/discourse-vimeo-upload.git` as the repository URL.

- Create an account and app on Vimeo Developers:
https://developer.vimeo.com/apps/new

- Request Upload Access on the app page

- Generate an access token with Upload permissions

- Go to the Plugin settings page on your Discourse Admin, and add the generated access token in the `vimeo api access token` setting, and save

- Adjust view and embed privacy options 

  - See [this vimeo page](https://developer.vimeo.com/api/reference/videos#edit_video) for privacy options: `privacy.view` and `privacy.embed`

- You should now be able to upload videos from the Discourse topic composer

## Posting a video

- To post a video, create a new Topic, and click the Upload button (the same button used for images and other files).

- Choose a video file.
  - Formats supported by the plugin are: `mp4, flv, wmv, mov, avi`
  - If you want other video formats, please request
  
- Click the Upload to Vimeo button. 
  - It will show you upload progress, and then it will wait till Vimeo transcodes the video.
  - The modal will remain open till the transcoding is complete.
  - Once transcoding is complete, the video link will be added to the composer.
  
- Save the post, and your video can be viewed by all other community users 
  (depending on privacy options you selected).
  
### Feature Requests

You can request additional features or support by [contacting me](https://meta.discourse.org/u/ti0/summary).  

### Contributions

If you found the plugin helpful, please consider donating to the plugin developer using this Paypal link:
https://paypal.me/ti0it

Big and small contributions are equally welcome :) 

If you would like to enhance the plugin, PRs are welcome.

Jekyll::Hooks.register :posts, :pre_render do |post|
  # Skip if the post already has manually defined images
  next if post.data['img'] || post.data['imgs']

  # Get the post date for directory naming
  post_date = post.date.strftime('%Y-%m-%d')

  # Check if there's a custom image directory specified
  if post.data['image_dir']
    image_dir = post.data['image_dir']
  else
    # Default to assets/images/talks/YYYY-MM-DD/ based on post date
    image_dir = "assets/images/talks/#{post_date}"
  end

  # Convert to absolute path for file system check
  site_source = post.site.source
  full_image_dir = File.join(site_source, image_dir)

  # Only proceed if the directory exists
  if Dir.exist?(full_image_dir)
    # Find all .png and .jpg files in the directory
    image_files = Dir.glob(File.join(full_image_dir, "*.{png,jpg,jpeg}")).sort

    if image_files.any?
      # Convert absolute paths back to relative paths for Jekyll
      relative_images = image_files.map do |file|
        relative_path = file.gsub("#{site_source}/", "")
        { 'path' => relative_path }
      end

      if relative_images.length == 1
        # Single image: use 'img' field
        post.data['img'] = relative_images.first
      else
        # Multiple images: use 'imgs' field for carousel
        post.data['imgs'] = relative_images
      end
    end
  end
end
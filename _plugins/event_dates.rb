require 'date'

# A date-only event stays current through its Stockholm calendar day. Do not
# invent its end time. The browser repeats this selection as a build ages.
module ScientiFika
  class EventDates < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      old_timezone = ENV['TZ']
      ENV['TZ'] = 'Europe/Stockholm'
      now = site.time.to_i
      talks = site.posts.docs.select { |post| post.data.fetch('categories', []).include?('talk') }
      announcements = site.posts.docs.select { |post| post.data.fetch('categories', []).include?('announcement') }
      site.posts.docs.each do |post|
        day = Date.parse(post.date.strftime('%Y-%m-%d'))
        expiry_day = announcements.include?(post) && post.data['expires'] ? Date.parse(post.data['expires'].to_s) : day
        next_day = expiry_day + 1
        post.data['sf_date'] = day.iso8601
        post.data['sf_year'] = day.year.to_s
        post.data['sf_end_epoch'] = Time.local(next_day.year, next_day.month, next_day.day).to_i
        post.data['sf_is_upcoming'] = post.data['sf_end_epoch'] > now
        post.data['sf_archive_featured'] = false
        details = (site.data['talk_details'] || {})[post.url] || {}
        post.data['sf_details'] = details
        post.content = 'The abstract for this archived talk is currently unavailable.' if details['abstract_unavailable']
        post.data['sf_time'] = details['time'] || post.data['time']
        post.data['sf_venue'] = details['venue'] || post.data['venue']
        post.data['sf_speaker_link'] = details['hide_speaker_link'] ? nil : post.data['link']
        post.data['sf_images'] = images_for(post, site).map do |image|
          description = (site.data['image_descriptions'] || {})[image['path']] || {}
          image.merge(description)
        end
        Array(details['image_alts']).each_with_index do |alt, index|
          post.data['sf_images'][index]['alt'] = alt if post.data['sf_images'][index]
        end
      end
      talks.sort_by! { |post| [post.data['sf_date'], post.url] }
      upcoming = talks.select { |post| post.data['sf_is_upcoming'] }
      past = talks.reject { |post| post.data['sf_is_upcoming'] }.reverse
      featured = past.select { |post| post.data['sf_images'].any? }.first(3)
      featured.each { |post| post.data['sf_archive_featured'] = true }
      site.config['sf_announcements'] = announcements.select { |post| post.data['sf_is_upcoming'] }.sort_by(&:date).reverse
      site.config['sf_build_epoch'] = now
      site.config['sf_talks'] = talks.reverse
      site.config['sf_upcoming'] = upcoming
      site.config['sf_past'] = past
      site.config['sf_featured_talks'] = featured
      site.config['sf_years'] = talks.map { |post| post.data['sf_year'] }.uniq.reverse
    ensure
      ENV['TZ'] = old_timezone
    end

    private

    def images_for(post, site)
      # Match auto_images.rb before rendering pages, without changing the post
      # front matter or the inputs accepted by the existing form importer.
      images = []
      images << post.data['img'] if post.data['img']
      images.concat(Array(post.data['imgs'])) if post.data['imgs']
      if images.empty?
        directory = post.data['image_dir'] || "assets/images/talks/#{post.data['sf_date']}"
        root = File.join(site.source, directory)
        images = Dir.glob(File.join(root, '*.{png,jpg,jpeg,PNG,JPG}')).sort.map do |file|
          { 'path' => file.delete_prefix("#{site.source}/") }
        end
      end
      images.map do |image|
        image.is_a?(Hash) ? image : (image.to_s.match?(%r{\A(?:https?:)?//}) ? { 'href' => image } : { 'path' => image })
      end.uniq { |image| image['path'] || image['href'] }
    end
  end
end

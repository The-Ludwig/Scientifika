# Keep topic curation separate from archived abstracts and existing post URLs.
module ScientiFika
  class TalkTags < Jekyll::Generator
    safe true
    priority :lowest

    def generate(site)
      topics = Array(site.data['talk_topics'])
      topic_index = topics.to_h { |topic| [topic.fetch('id'), topic] }
      curated = site.data['talk_tags'] || {}
      used_ids = []
      site.posts.docs.each do |post|
        next unless post.data.fetch('categories', []).include?('talk')
        key = File.basename(post.path, File.extname(post.path))
        # Jekyll supplies [] even when no tags were written in the front matter.
        # A nonempty front-matter list takes precedence over archive curation.
        front_matter_tags = Array(post.data['tags'])
        ids = (front_matter_tags.empty? ? Array(curated[key]) : front_matter_tags).uniq
        unknown = ids.reject { |id| topic_index.key?(id) }
        unless unknown.empty?
          raise Jekyll::Errors::FatalException, "Unknown talk tag(s) in #{post.path}: #{unknown.join(', ')}. Add labels to _data/talk_topics.yml."
        end
        post.data['sf_tags'] = ids.map { |id| topic_index.fetch(id) }
        post.data['sf_tag_search'] = post.data['sf_tags'].flat_map { |tag| [tag['id'], tag['label']] }.join(' ')
        used_ids.concat(ids)
      end
      site.config['sf_topics'] = topics.select { |topic| used_ids.include?(topic['id']) }
    end
  end
end

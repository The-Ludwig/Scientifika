# ScientiFika

The Jekyll website for ScientiFika: accessible science, conversation and fika for the research community in Stockholm and Uppsala.

## Local development

Use Ruby 3.3 (the version used by the existing GitHub Pages workflow), Bundler and the checked-in `Gemfile.lock`.

```sh
bundle install
bundle exec jekyll serve --host 127.0.0.1
```

Open http://127.0.0.1:4000/. For a static production check:

```sh
JEKYLL_ENV=production bundle exec jekyll build
```

## Content and templates

- `index.md`: newcomer homepage. The collage automatically selects the three newest dated talk posts, including upcoming talks; the next-talk section is also generated from the posts.
- `talks.md`: current programme and archive searchable by title, speaker or tags, with year and topic filters and ten talks per page. Existing talk URLs are preserved.
- `_layouts/talk.html`: complete abstract, speaker, audience, artwork and presentation links.
- `events.html` and `scientifikart.html`: dated special-event stories and the ScientiFikART programme.
- `about.html`, `join.html`, `testimonials.md`: the community, first-visit information and testimonials.
- `_data/team.yml`, `_data/testimonials.yml`: existing biographies and testimonials.
- `_data/community.yml`: public form URLs and ScientiFikART contributors.
- `_includes/brand.html`: the full original logo SVG, including its scientific-symbol steam, and Dancing Script wordmark. Keep the original logo files unchanged.
- `assets/css/editorial.css`: responsive editorial design. `assets/js/editorial.js` handles navigation, disclosures and maths; `assets/js/programme.js` handles filtering and date rollover.

## Adding a talk

The existing form-to-draft-PR workflow remains unchanged. A talk continues to use `_posts/YYYY-MM-DD-Surname.md`, `layout: talk`, `categories: talk`, `title`, `speaker`, `date` and `opento` (`juniors` or `everyone`). Keep abstracts in the post body. Optional fields include `link`, `presentation`, `img`, `imgs`, `img_credit`, and `image_dir`.

Images can be supplied explicitly or placed in `assets/images/talks/YYYY-MM-DD/` for automatic discovery. Existing image directories and metadata continue to work. When rescheduling a talk, preserve `image_dir` if needed; changing its date changes its URL.

The homepage collage refreshes on every build without editing `index.md`. For social artwork, add optional `poster: { path: "assets/images/talks/YYYY-MM-DD/poster.png" }` to the talk. Existing poster mappings live in `_data/poster_art.yml`. Without a poster, the card uses the talk’s date, title, speaker and first image; talks without images still appear.

Optional `time` (a quoted string) and `venue` fields display confirmed event details. If they are absent, upcoming talk pages show the regular Friday 16:00 / Nordita meeting information as the usual schedule.

An optional `short_description` gives the homepage's next talk a brief, factual subject line, for example `"On the origins of string theory."`. Use the speaker's title or abstract as its source, not a generic promotional slogan. Existing talks can use the same field under their URL in `_data/talk_details.yml`. The line follows the selected next talk, disappears when that talk has passed, and is omitted when no description is supplied.

### Talk topics

Add one or more topic IDs to a new talk's front matter, for example:

```yaml
tags: [physics, astronomy-cosmology]
```

The available IDs and display labels are in `_data/talk_topics.yml`. Use only topics supported by the title or abstract; a speaker's background alone is not a reason to add a topic. Use `outside-academia` for talks about work or careers outside universities, `academic-life` for academic careers and working life, and `community-events` for shared events such as Q&A sessions and seasonal gatherings. A talk may have several topics, including different subjects in a joint session.

The existing archive is curated in `_data/talk_tags.yml`, keyed by the source filename without `.md`. Nonempty front-matter `tags` take precedence over this table. Untagged future talks still appear in the archive; they simply have no topic links until tags are added. To introduce a topic, add its stable lowercase hyphenated ID and label to `talk_topics.yml` first. The build rejects unknown topic IDs to catch typos. The original archived post files remain unchanged.

Selecting multiple topics returns talks with **all** selected topics; search and year filters apply as well. Tag links open the matching archive, and filter state is stored in the URL, for example `/talks/?tag=physics&tag=climate-environment&year=2025#archive`. Tags are visible on talk pages and archive entries even without JavaScript; filtering itself requires JavaScript.

The archive shows ten matching past talks per page, including any featured cards. Page controls appear above and below the results, with a selector for jumping directly to a page. Search and filters cover the whole archive and return to page one when changed. The `page` URL parameter preserves the selected page when sharing or reloading. Browser Back and Forward restore page selections, including when using Back to return from a talk.

`_plugins/event_dates.rb` treats date-only events as current through their calendar day in Europe/Stockholm. No end time is inferred. The browser updates an already-open or cached page after that boundary. Without JavaScript, pages retain their build-time selection and a fully readable archive.

An announcement uses `categories: announcement`. An optional `expires: YYYY-MM-DD` keeps it visible through that Stockholm calendar day; otherwise it expires after its post date.

## Publication

The existing workflow deploys pushes to `main` and manual dispatches. A local build does not deploy anything. The source rebuild must be reviewed and publication explicitly authorised before pushing or merging.

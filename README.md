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
- `talks.md`: current programme and archive searchable by title or speaker, with a year filter. Existing talk URLs are preserved.
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

`_plugins/event_dates.rb` treats date-only events as current through their calendar day in Europe/Stockholm. No end time is inferred. The browser updates an already-open or cached page after that boundary. Without JavaScript, pages retain their build-time selection and a fully readable archive.

An announcement uses `categories: announcement`. An optional `expires: YYYY-MM-DD` keeps it visible through that Stockholm calendar day; otherwise it expires after its post date.

## Publication

The existing workflow deploys pushes to `main` and manual dispatches. A local build does not deploy anything. The source rebuild must be reviewed and publication explicitly authorised before pushing or merging.

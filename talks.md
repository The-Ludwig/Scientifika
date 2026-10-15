---
layout: base
title: "What’s on"
navname: "What’s on"
---
<div class="wrap">
  <section class="page-heading">
    <h1>Talks at<br>ScientiFika.</h1>
    <p>Upcoming talks and our archive.</p>
  </section>
  {% include next-talk.html %}
  {% if site.sf_upcoming.size > 1 %}
  <section class="also-coming" aria-label="Also coming up">
    <h2>Also coming up</h2>
    {% for talk in site.sf_upcoming offset:1 %}
    <a class="archive-item" href="{{ talk.url | relative_url }}" data-upcoming-row data-talk-url="{{ talk.url | relative_url }}" data-end="{{ talk.sf_end_epoch }}"><time class="date-small" datetime="{{ talk.sf_date }}">{{ talk.date | date: '%-d %b %Y' }}</time><div><strong>{{ talk.title | escape }}</strong><small>{{ talk.speaker | strip_html | escape }}</small></div><span>{% if talk.opento == 'everyone' %}Open to everyone{% elsif talk.opento == 'juniors' %}Students &amp; postdocs{% else %}See event details{% endif %}</span></a>
    {% endfor %}
  </section>
  {% endif %}
  <section class="archive" id="archive" data-talk-archive>
    <div class="archive-head">
      <h2>From the archive</h2>
      <form class="filters" role="search" aria-label="Filter past talks" data-archive-filters hidden>
        <label class="sr-only" for="talk-search">Search talks, speakers or tags</label>
        <input id="talk-search" name="q" placeholder="Search talks, speakers or tags" type="search" autocomplete="off">
        <label class="sr-only" for="talk-year">Filter by year</label>
        <select id="talk-year" name="year"><option value="all">All years</option>{% for year in site.sf_years %}<option>{{ year }}</option>{% endfor %}</select>
        <button type="reset" class="filter-reset">Reset</button>
        <details class="tag-filters" data-tag-filters>
          <summary>Filter by topic<span data-tag-count></span></summary>
          <fieldset>
            <legend class="sr-only">Topics</legend>
            <p class="tag-filter-help">Choose more than one to find talks covering all selected topics.</p>
            <div class="tag-options">
              {% for tag in site.sf_topics %}<label class="tag-filter"><input type="checkbox" name="tag" value="{{ tag.id | escape }}"><span>#{{ tag.label | escape }}</span></label>{% endfor %}
            </div>
          </fieldset>
        </details>
      </form>
    </div>
    <p class="archive-status" data-result-count role="status" aria-live="polite" aria-atomic="true" tabindex="-1">{{ site.sf_past.size }} past talks</p>
    {% include archive-pagination.html position='top' %}
    <div class="gallery">
      {% for talk in site.sf_featured_talks %}{% include talk_card.html talk=talk %}{% endfor %}
    </div>
    <div class="archive-list">
      {% for talk in site.sf_talks %}{% unless talk.sf_archive_featured %}
      <div class="archive-item" data-archive-entry data-end="{{ talk.sf_end_epoch }}" data-year="{{ talk.sf_year }}" data-tags="{{ talk.sf_tags | map: 'id' | join: ' ' | escape }}" data-search="{{ talk.title | append: ' ' | append: talk.speaker | append: ' ' | append: talk.sf_tag_search | strip_html | escape }}" {% if talk.sf_is_upcoming %}hidden{% endif %}>
        <time class="date-small" datetime="{{ talk.sf_date }}">{{ talk.date | date: '%-d %b %Y' }}</time>
        <div><a class="archive-title" href="{{ talk.url | relative_url }}"><strong>{{ talk.title | escape }}</strong><small>{{ talk.speaker | strip_html | escape }}</small></a>{% include talk-tags.html talk=talk %}</div>
      </div>
      {% endunless %}{% endfor %}
    </div>
    <p class="empty" data-archive-empty hidden>No talks match these filters. Try fewer topics, another search or all years.</p>
    {% include archive-pagination.html position='bottom' %}
    <a class="text-link archive-return" href="#archive">Back to archive filters</a>
    <p class="archive-note">Original artwork retains the wording and dates of its announcement.</p>
  </section>
</div>

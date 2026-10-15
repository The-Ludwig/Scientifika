---
layout: base
title: "What’s on"
navname: "What’s on"
---
<div class="wrap">
  <section class="page-heading">
    <h1>A new perspective<br>for your Friday.</h1>
    <p>Explore the programme and the conversations that came before.</p>
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
        <label class="sr-only" for="talk-search">Search talks or speakers</label>
        <input id="talk-search" name="q" placeholder="Search talks or speakers" type="search" autocomplete="off">
        <label class="sr-only" for="talk-year">Filter by year</label>
        <select id="talk-year" name="year"><option value="all">All years</option>{% for year in site.sf_years %}<option>{{ year }}</option>{% endfor %}</select>
        <button type="reset" class="filter-reset">Reset</button>
      </form>
    </div>
    <p class="archive-status" data-result-count role="status" aria-live="polite" aria-atomic="true">{{ site.sf_past.size }} past talks</p>
    <div class="gallery">
      {% for talk in site.sf_featured_talks %}{% include talk_card.html talk=talk %}{% endfor %}
    </div>
    <div class="archive-list">
      {% for talk in site.sf_talks %}{% unless talk.sf_archive_featured %}
      <a class="archive-item" href="{{ talk.url | relative_url }}" data-archive-entry data-end="{{ talk.sf_end_epoch }}" data-year="{{ talk.sf_year }}" data-search="{{ talk.title | append: ' ' | append: talk.speaker | strip_html | escape }}" {% if talk.sf_is_upcoming %}hidden{% endif %}>
        <time class="date-small" datetime="{{ talk.sf_date }}">{{ talk.date | date: '%-d %b %Y' }}</time>
        <div><strong>{{ talk.title | escape }}</strong><small>{{ talk.speaker | strip_html | escape }}</small></div>
      </a>
      {% endunless %}{% endfor %}
    </div>
    <p class="empty" data-archive-empty hidden>No talks match these filters. Try another name or choose all years.</p>
    <a class="text-link archive-return" href="#archive">Back to archive filters</a>
    <p class="archive-note">Original artwork retains the wording and dates of its announcement.</p>
  </section>
</div>

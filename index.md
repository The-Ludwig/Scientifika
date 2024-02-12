---
layout: default
title: "Home"
navname: "Home"
---
<h1>
Welcome to ScientiFika
</h1>
<div class="container">
    <div class="row flex-column-reverse flex-lg-row justify-content-between">
        <div class="col-lg-9">
            ToDos:
            <ul>
                <li>Content</li>
                <li>Make Google-Form link available via password</li>
                <li>Show upcoming Talks on the home page</li>
                <li>Vector-Logo?</li>
                <li>Colors?</li>
                <li>Get a nice URL</li>
                <li>About-section/legality</li>
            </ul>
            <h3>Upcoming Talks</h3>
            <div class="row" id="sf-upcoming">
                {% assign talks_by_date = site.categories.talk | sort: "date" | reverse %}
                {% for post in talks_by_date %}
                <!-- This skips all the posts which are in the past, so the main page has a smaller loading time -->
                {% assign today_date = 'now' | date: '%s' %}
                {% assign pre_date = post.date | date: '%s' %}
                {% if today_date > pre_date %} {% continue %} {% endif %}
                <div class="col-lg-12 sf-talk-card d-none" data-date='{{ post.date | date: "%Y-%m-%d" }}'>
                {% include talk_card.html talk=post%}
                </div>
                {% endfor %}
            </div>
            <h2 class="mt-5">Announcements</h2>
            <div class="row">
                {% assign announcements_by_date = site.categories.announcement | sort: "date" | reverse %}
                {% for post in announcements_by_date %}
                <div class="" data-date='{{ post.date | date: "%Y-%m-%d" }}'>
                {% include announcement.html talk=post%}
                </div>
                {% endfor %}
            </div>
        </div>
        <div class="col-lg-3 d-lg-flex justify-content-start flex-column">
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light">Attendance List</a>
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light">Give a Talk</a>
        </div>
    </div>
</div>

<script defer src="{{site.baseurl}}/assets/js/upcoming.js"></script>

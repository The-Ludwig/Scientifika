---
layout: default
title: "Home"
navname: "Home"
---
<div class="container">
    <div class="row flex-column-reverse flex-lg-row justify-content-between">
        <div class="col-lg-9">
            <span class="col sf-logo fw-bold display-4">
                    <span class="text-primary" style="margin-right: -0.2em;">Scienti</span>
                    <span class="text-secondary">Fika</span>
                </span>
is the place to be every Friday afternoon if you want to learn more about a variety of research fields while enjoying delicious Fika! We bring together researchers across different universities in Stockholm to share their passion for science and related topics, while nourishing a deep sense of community among junior researchers.
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
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" href="">Attendance List</a>
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" href="https://docs.google.com/forms/d/e/1FAIpQLSegmOTDLDQ46egDfAdh-JB_QHjRMoDtNGT7lrPMFF4GKLvyCw/viewform?usp=sharing">Mailing List</a>
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" href="https://docs.google.com/forms/d/e/1FAIpQLSdvz9m5FOU57K3mNYNjH04mTR2UGB1KAubC5khwf6u6_u0NUg/viewform?usp=sf_link">Give a Talk</a>
        </div>
    </div>
</div>

<script defer src="{{site.baseurl}}/assets/js/upcoming.js"></script>

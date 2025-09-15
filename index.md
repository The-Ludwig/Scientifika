---
layout: default
title: "Home"
navname: "Home"
---
<div class="container">
    <div class="row flex-column-reverse flex-lg-row justify-content-between">
        <div class="col-lg-9">
            <div class="mb-5 row">
                <div class="col-4 col-lg-2">
                    <img class="img-fluid" src="{% link assets/Scientifika-logo.svg %}"/>
                </div>
                <div class="col-8 col-lg-10">
                    <span class="col sf-logo fw-bold display-6">
                        <span class="text-primary" style="margin-right: -0.2em;">Scienti</span>
                        <span class="text-secondary">Fika</span>
                    </span>
                    is the place to be every Friday afternoon if you want to learn more about a variety of research fields while enjoying delicious Fika! We bring together researchers across different universities in Stockholm to share their passion for science and related topics, while nourishing a deep sense of community among junior researchers.
                </div>
            </div>
            {% if site.categories.announcement %}
            <div class="row" id="sf-announcements">
                <h2>Announcements</h2>
                {% assign announcements_by_date = site.categories.announcement | sort: "date" | reverse %}
                {% for post in announcements_by_date %}
                <div class="" data-date='{{ post.date | date: "%Y-%m-%d" }}'>
                {% include announcement.html talk=post id=forloop.index0%}
                </div>
                {% endfor %}
            </div>
            {% endif %}
            <div id="sf-upcoming-section">
                <h2>Upcoming</h2>
                <h4>Friday <b>15:00</b> @ Nordita 6th floor</h4>
                <div class="row" id="sf-upcoming">
                    {% assign talks_by_date = site.categories.talk | sort: "date" %}
                    <!-- This skips all the posts which are in the past, so the main page has a smaller loading time -->
                    {% assign seconds = 1 | times: 24 | times: 60 | times: 60 %}
                    {% assign tomorrow_date = 'now' | date: '%s' | minus: seconds | date: '%s' %}
                    {% for post in talks_by_date %}
                    {% assign pre_date = post.date | date: '%s' %}
                    {% if tomorrow_date > pre_date %} {% continue %} {% endif %}
                    <div class="col-lg-12 sf-talk-card d-none" data-date='{{ post.date | date: "%Y-%m-%d" }}'>
                    {% include talk_card.html talk=post%}
                    </div>
                    {% endfor %}
                </div>
            </div>
        </div>
        <div class="col-lg-3 d-lg-flex mb-4 justify-content-start flex-column">
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSegmOTDLDQ46egDfAdh-JB_QHjRMoDtNGT7lrPMFF4GKLvyCw/viewform?usp=sharing">📋  Join the Mailing List</a>
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSdvz9m5FOU57K3mNYNjH04mTR2UGB1KAubC5khwf6u6_u0NUg/viewform?usp=sf_link">🧑‍🏫 Give a Talk!</a>
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLScB_JMoqayw-absw3h_QmKlvyxnLHYckkmsoyeT4fbrG1NThg/viewform?usp=sf_link">📊 Attendance Form</a>
            <a class="btn btn-primary w-lg-75 m-2 fs-5 text-light" target="_blank" href="https://forms.gle/364xQjgWiZyDYAzA8"> 📬 Suggestion Box</a>
        </div>
    </div>
</div>

<script defer src="{{site.baseurl}}/assets/js/upcoming.js"></script>

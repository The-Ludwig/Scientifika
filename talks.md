---
layout: default
title: "All Talks"
navname: "All Talks"
---
<div class="container">
    <div class="row">
        {% assign talks_by_date = site.categories.talk | sort: "date" | reverse %}
        {% for post in talks_by_date %}
        {% include talk_card.html talk=post%}
        {% endfor %}
    </div>
</div>

---
layout: base
title: Voices from the community
navname: Testimonials
permalink: /testimonials/
nav_section: story
description: ScientiFika participants reflect on the talks, conversations and community in the 2023 feedback survey.
---
<div class="wrap">
  <section class="page-heading"><a class="back text-link" href="{{ '/about/' | relative_url }}">Back to our story</a><h1>Voices from<br><span class="serif italic">the community.</span></h1><p>In their own words.</p></section>
  <div class="testimonials-intro"><p>We asked our attendees what they thought about ScientiFika in our 2023 Feedback survey.</p><p>You can find some of the responses below; <a class="text-link" href="https://docs.google.com/document/d/1PZBmBTGhUsXfazL44iGe_oQ1sGvNiQYBPensLQEiD2E/edit">the full report can be found here</a>.</p></div>
  <section class="testimonials" aria-label="Responses from the 2023 feedback survey">
    {% for testi in site.data.testimonials %}
    <figure class="testimonial"><blockquote class="quote"><p>“{{ testi }}”</p></blockquote></figure>
    {% endfor %}
  </section>
</div>
{% include invitation.html %}

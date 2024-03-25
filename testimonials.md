---
layout: default
title: "Testimonials"
navname: "Testimonials"
---
<h5 class="mb-5">
We asked our attendants what they thought about ScientiFika in our 2023 Feedback survey.
You can find some of the responses below, <a target="_blank" href="https://docs.google.com/document/d/1PZBmBTGhUsXfazL44iGe_oQ1sGvNiQYBPensLQEiD2E/edit">the full report can be found here <i class="bi bi-file-earmark-text"></i></a>.
</h5>

{% for testi in site.data.testimonials %}
<figure class="text-end mb-5">
  <blockquote class="blockquote fst-italic">
    <p>
    "{{ testi }}"
    </p>
    <hr/>
  </blockquote>
</figure>
{% endfor %}

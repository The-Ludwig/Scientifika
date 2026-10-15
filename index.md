---
layout: base
title: Home
navname: Home
---
<div class="wrap">
  <section class="hero">
    <div class="hero-copy">
      <h1><span class="hero-line">Come for</span><span class="hero-line">the science.</span><span class="serif italic">Stay for the fika.</span></h1>
      <p>On Fridays, we bring together students and researchers across Stockholm’s universities to share their passion for science, explore different fields and enjoy delicious fika!</p>
      <a class="button" href="{{ '/talks/' | relative_url }}">Find your next fika</a>
    </div>
    {% include hero-posters.html %}
  </section>
  <div class="logistics" aria-label="Regular Stockholm gatherings">
    <span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7 3v4m10-4v4M4 10h16M4 5h16v16H4z"/></svg>Fridays at 16:00</span>
    <span><svg aria-hidden="true" viewBox="0 0 24 24"><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0z"/><circle cx="12" cy="10" r="2"/></svg>Nordita, 6th floor</span>
    <span><svg aria-hidden="true" viewBox="0 0 24 24"><circle cx="9" cy="7" r="3"/><path d="M3 21v-3a6 6 0 0 1 12 0v3zm13-17a3 3 0 1 1 0 6m2 4a5 5 0 0 1 3 4v3h-3"/></svg>Science. Conversation. Fika.</span>
  </div>
  {% include notices.html %}
  <section class="next-section" aria-label="Next talk">
    <div class="section-intro"><h2>Next up</h2><p>New perspectives.<br>Same good company.</p></div>
    {% include next-talk.html mode='home' %}
  </section>
</div>
<section class="yellow section">
  <div class="wrap feature">
    <figure class="art-frame"><img src="{{ '/assets/editorial/art-poster.jpg' | relative_url }}" loading="lazy" alt="Original ScientiFikART poster for 29 May 2026"></figure>
    <div class="feature-info"><div class="small-label">Past event · 29 May 2026</div><h2>A different kind<br>of experiment.</h2><p>Science through art, music, poetry, sculpture, textiles and storytelling. Look back at ScientiFikART at Proviant, Campus Albano.</p><a class="button" href="{{ '/events/scientifikart-2026/' | relative_url }}">Explore ScientiFikART</a><div><a class="text-link" href="{{ '/events/' | relative_url }}">More beyond the talks</a></div></div>
  </div>
</section>
<section class="section wrap">
  <div class="feature">
    <figure class="feature-photo"><img class="community-photo" src="{{ '/assets/editorial/community.jpg' | relative_url }}" loading="lazy" width="1600" height="1200" alt="Researchers gathered around tables for a ScientiFika talk"><figcaption>ScientiFika in 2024.</figcaption></figure>
    <div class="community-copy"><h2>A room for<br><span class="serif italic">questions.</span></h2><p>You don’t need to work in the speaker’s field. Our talks are meant to be accessible across disciplines, with space to ask, discuss and get to know the people behind the research.</p><p class="muted">Most Fridays are for students and postdocs. Selected events bring the wider academic community together; each event tells you who it is for.</p><a class="text-link" href="{{ '/about/' | relative_url }}">Meet ScientiFika</a></div>
  </div>
</section>
{% include invitation.html %}

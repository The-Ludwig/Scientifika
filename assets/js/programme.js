(() => {
  'use strict';
  const archive = document.querySelector('[data-talk-archive]');
  const form = archive?.querySelector('[data-archive-filters]');
  const entries = archive ? [...archive.querySelectorAll('[data-archive-entry]')] : [];
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const isCurrent = (element, now) => Number(element.dataset.end) > now;

  function filterArchive(now = Date.now() / 1000) {
    if (!archive || !form) return;
    const query = normalise(form.elements.q.value);
    const year = form.elements.year.value;
    let visible = 0;
    entries.forEach(entry => {
      const matches = !isCurrent(entry, now)
        && (!query || normalise(entry.dataset.search).includes(query))
        && (year === 'all' || entry.dataset.year === year);
      entry.hidden = !matches;
      if (matches) visible += 1;
    });
    archive.querySelector('[data-result-count]').textContent = `${visible} past ${visible === 1 ? 'talk' : 'talks'} · search by title or speaker`;
    archive.querySelector('[data-archive-empty]').hidden = visible > 0;
    archive.querySelector('.gallery').hidden = !archive.querySelector('.gallery [data-archive-entry]:not([hidden])');
  }

  function refreshDates() {
    const now = Date.now() / 1000;
    const selectedURLs = new Set();
    document.querySelectorAll('[data-next-talk]').forEach(container => {
      let selected = false;
      container.querySelectorAll('[data-next-candidate]').forEach(candidate => {
        const show = !selected && isCurrent(candidate, now);
        candidate.hidden = !show;
        if (show) {
          selected = true;
          selectedURLs.add(candidate.dataset.talkUrl);
        }
      });
      container.querySelector('[data-next-empty]').hidden = selected;
    });
    document.querySelectorAll('[data-upcoming-only], [data-upcoming-row]').forEach(element => {
      element.hidden = !isCurrent(element, now) || (element.hasAttribute('data-upcoming-row') && selectedURLs.has(element.dataset.talkUrl));
    });
    document.querySelectorAll('[data-announcement-list]').forEach(section => {
      section.hidden = !section.querySelector('[data-upcoming-only]:not([hidden])');
    });
    const alsoComing = document.querySelector('.also-coming');
    if (alsoComing) alsoComing.hidden = !alsoComing.querySelector('[data-upcoming-row]:not([hidden])');
    filterArchive(now);
  }

  if (form) {
    const params = new URLSearchParams(window.location.search);
    form.elements.q.value = params.get('q') || '';
    for (const name of ['year']) {
      const value = params.get(name);
      if ([...form.elements[name].options].some(option => option.value === value)) form.elements[name].value = value;
    }
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    form.addEventListener('input', () => filterArchive());
    form.addEventListener('change', () => filterArchive());
    form.addEventListener('reset', () => setTimeout(() => filterArchive(), 0));
  }
  refreshDates();
  // Recheck open tabs and cached pages across midnight without a server rebuild.
  window.setInterval(refreshDates, 60000);
  window.addEventListener('pageshow', refreshDates);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDates();
  });
})();

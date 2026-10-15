(() => {
  'use strict';
  const archive = document.querySelector('[data-talk-archive]');
  const form = archive?.querySelector('[data-archive-filters]');
  const entries = archive ? [...archive.querySelectorAll('[data-archive-entry]')] : [];
  const tagInputs = form ? [...form.querySelectorAll('input[name="tag"]')] : [];
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const isCurrent = (element, now) => Number(element.dataset.end) > now;
  const selectedTags = () => tagInputs.filter(input => input.checked).map(input => input.value);

  function readFilters() {
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    form.elements.q.value = params.get('q') || '';
    const year = params.get('year');
    form.elements.year.value = [...form.elements.year.options].some(option => option.value === year) ? year : 'all';
    const tags = new Set(params.getAll('tag'));
    tagInputs.forEach(input => { input.checked = tags.has(input.value); });
    if (selectedTags().length) form.querySelector('[data-tag-filters]').open = true;
  }

  function writeFilters() {
    if (!form) return;
    const url = new URL(window.location.href);
    ['q', 'year', 'tag'].forEach(name => url.searchParams.delete(name));
    const query = form.elements.q.value.trim();
    if (query) url.searchParams.set('q', query);
    if (form.elements.year.value !== 'all') url.searchParams.set('year', form.elements.year.value);
    selectedTags().forEach(tag => url.searchParams.append('tag', tag));
    window.history.replaceState(window.history.state, '', url);
  }

  function filterArchive(now = Date.now() / 1000) {
    if (!archive || !form) return;
    // Search words and hashtags independently, so "#physics #quantum-physics"
    // and accented speaker names work alongside the topic checkboxes.
    const terms = normalise(form.elements.q.value).replace(/#/g, '').split(/\s+/).filter(Boolean);
    const year = form.elements.year.value;
    const tags = selectedTags();
    let visible = 0;
    entries.forEach(entry => {
      const search = normalise(entry.dataset.search);
      const entryTags = (entry.dataset.tags || '').split(' ');
      const matches = !isCurrent(entry, now)
        && terms.every(term => search.includes(term))
        && (year === 'all' || entry.dataset.year === year)
        && tags.every(tag => entryTags.includes(tag));
      entry.hidden = !matches;
      if (matches) visible += 1;
    });
    const filtered = terms.length || tags.length || year !== 'all';
    archive.querySelector('[data-result-count]').textContent = `${visible} past ${visible === 1 ? 'talk' : 'talks'}${filtered ? (visible === 1 ? ' matches your filters' : ' match your filters') : ''}`;
    form.querySelector('[data-tag-count]').textContent = tags.length ? ` (${tags.length} selected)` : '';
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
    document.querySelectorAll('[data-next-description]').forEach(description => {
      description.hidden = !selectedURLs.has(description.dataset.talkUrl);
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
    readFilters();
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    const applyFilters = () => { filterArchive(); writeFilters(); };
    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('reset', () => setTimeout(() => applyFilters(), 0));
    window.addEventListener('popstate', () => { readFilters(); filterArchive(); });
  }
  refreshDates();
  // Recheck open tabs and cached pages across midnight without a server rebuild.
  window.setInterval(refreshDates, 60000);
  window.addEventListener('pageshow', refreshDates);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDates();
  });
})();

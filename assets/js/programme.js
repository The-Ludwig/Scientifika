(() => {
  'use strict';
  const archive = document.querySelector('[data-talk-archive]');
  const form = archive?.querySelector('[data-archive-filters]');
  const entries = archive ? [...archive.querySelectorAll('[data-archive-entry]')] : [];
  const tagInputs = form ? [...form.querySelectorAll('input[name="tag"]')] : [];
  const pagers = archive ? [...archive.querySelectorAll('[data-archive-pagination]')] : [];
  const pageSize = 10;
  let currentPage = 1;
  const normalise = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase().trim();
  const isCurrent = (element, now) => Number(element.dataset.end) > now;
  const selectedTags = () => tagInputs.filter(input => input.checked).map(input => input.value);

  function readFilters() {
    if (!form) return;
    const params = new URLSearchParams(window.location.search);
    const page = Number(params.get('page'));
    currentPage = Number.isSafeInteger(page) && page > 0 ? page : 1;
    form.elements.q.value = params.get('q') || '';
    const year = params.get('year');
    form.elements.year.value = [...form.elements.year.options].some(option => option.value === year) ? year : 'all';
    const tags = new Set(params.getAll('tag'));
    tagInputs.forEach(input => { input.checked = tags.has(input.value); });
    if (selectedTags().length) form.querySelector('[data-tag-filters]').open = true;
  }

  function writeFilters(push = false) {
    if (!form) return;
    const url = new URL(window.location.href);
    ['q', 'year', 'tag', 'page'].forEach(name => url.searchParams.delete(name));
    const query = form.elements.q.value.trim();
    if (query) url.searchParams.set('q', query);
    if (form.elements.year.value !== 'all') url.searchParams.set('year', form.elements.year.value);
    selectedTags().forEach(tag => url.searchParams.append('tag', tag));
    if (currentPage > 1) url.searchParams.set('page', currentPage);
    window.history[push ? 'pushState' : 'replaceState'](window.history.state, '', url);
  }

  function filterArchive(now = Date.now() / 1000) {
    if (!archive || !form) return;
    // Search words and hashtags independently, so "#physics #quantum-physics"
    // and accented speaker names work alongside the topic checkboxes.
    const terms = normalise(form.elements.q.value).replace(/#/g, '').split(/\s+/).filter(Boolean);
    const year = form.elements.year.value;
    const tags = selectedTags();
    const matches = entries.filter(entry => {
      const search = normalise(entry.dataset.search);
      const entryTags = (entry.dataset.tags || '').split(' ');
      return !isCurrent(entry, now)
        && terms.every(term => search.includes(term))
        && (year === 'all' || entry.dataset.year === year)
        && tags.every(tag => entryTags.includes(tag));
    });
    const total = matches.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    currentPage = Math.min(Math.max(currentPage, 1), totalPages);
    const start = (currentPage - 1) * pageSize;
    const visible = new Set(matches.slice(start, start + pageSize));
    entries.forEach(entry => { entry.hidden = !visible.has(entry); });
    const filtered = terms.length || tags.length || year !== 'all';
    const range = total ? `Showing ${start + 1}–${Math.min(start + pageSize, total)} of ` : '';
    archive.querySelector('[data-result-count]').textContent = `${range}${total} past ${total === 1 ? 'talk' : 'talks'}${filtered ? (total ? ' matching your filters' : ' match your filters') : ''}`;
    form.querySelector('[data-tag-count]').textContent = tags.length ? ` (${tags.length} selected)` : '';
    archive.querySelector('[data-archive-empty]').hidden = total > 0;
    archive.querySelector('.gallery').hidden = !archive.querySelector('.gallery [data-archive-entry]:not([hidden])');
    pagers.forEach(pager => {
      pager.hidden = totalPages === 1;
      const select = pager.querySelector('[data-archive-page]');
      if (select.options.length !== totalPages) {
        select.replaceChildren(...Array.from({ length: totalPages }, (_, index) => {
          const option = document.createElement('option');
          option.value = String(index + 1);
          option.textContent = String(index + 1);
          return option;
        }));
      }
      select.value = String(currentPage);
      pager.querySelector('[data-page-total]').textContent = `of ${totalPages}`;
      pager.querySelector('[data-page-step="-1"]').disabled = currentPage === 1;
      pager.querySelector('[data-page-step="1"]').disabled = currentPage === totalPages;
    });
  }

  function changePage(page) {
    currentPage = page;
    filterArchive();
    writeFilters(true);
    const status = archive.querySelector('[data-result-count]');
    status.focus({ preventScroll: true });
    status.scrollIntoView({ block: 'start', behavior: 'instant' });
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
    writeFilters();
  }

  if (form) {
    readFilters();
    form.hidden = false;
    form.addEventListener('submit', event => event.preventDefault());
    const applyFilters = () => { currentPage = 1; filterArchive(); writeFilters(); };
    form.addEventListener('input', applyFilters);
    form.addEventListener('change', applyFilters);
    form.addEventListener('reset', () => setTimeout(() => applyFilters(), 0));
    pagers.forEach(pager => {
      pager.querySelector('[data-archive-page]').addEventListener('change', event => changePage(Number(event.target.value)));
      pager.querySelectorAll('[data-page-step]').forEach(button => {
        button.addEventListener('click', () => changePage(currentPage + Number(button.dataset.pageStep)));
      });
    });
    window.addEventListener('popstate', () => { readFilters(); filterArchive(); writeFilters(); });
  }
  refreshDates();
  // Recheck open tabs and cached pages across midnight without a server rebuild.
  window.setInterval(refreshDates, 60000);
  window.addEventListener('pageshow', refreshDates);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) refreshDates();
  });
})();

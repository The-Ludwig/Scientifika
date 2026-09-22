/**
 * ScientiFika: Google Form -> GitHub pull request
 *
 * On every form submission this opens a pull request against the website repo
 * containing a ready-to-merge post in `_posts/` and any images the speaker
 * uploaded, filed under the date the post is for. Nothing is written to `main`.
 *
 * The date is a guess (see guessTalkDate) and the abstract is unedited, so a PR
 * is a starting point, not a finished post. Every raw answer is reproduced in
 * the PR description.
 *
 * Deliberately schema-agnostic: it reads whatever questions the form currently
 * has, so adding or renaming a question does not require editing this file.
 *
 * Setup lives in README.md next to this file.
 */

const CONFIG = {
  owner: 'The-Ludwig',
  repo: 'Scientifika',
  baseBranch: 'main',

  postsDir: '_posts',
  branchPrefix: 'submission',
  imageDir: 'assets/images/talks',

  // Script Property holding the fine-grained GitHub PAT. Never hard-code it.
  tokenProperty: 'GITHUB_TOKEN',

  // Images larger than this are linked rather than committed, to keep the repo sane.
  maxImageBytes: 8 * 1024 * 1024,

  // Set false to stop emailing yourself when a submission fails to reach GitHub.
  notifyOnFailure: true,

  // Who the commits are attributed to. Set to null to use the token owner (you).
  // This changes the name on the commit only — the pull request is still opened by
  // whoever owns the token, and the audit log still records that token.
  commitAuthor: { name: 'ScientiFika Form', email: 'noreply@scientifika.se' },
};

/** One-time setup. Run this once from the editor, then authorise the scopes. */
function installTrigger() {
  const form = FormApp.getActiveForm();
  ScriptApp.getProjectTriggers()
    .filter((t) => t.getHandlerFunction() === 'onFormSubmit')
    .forEach((t) => ScriptApp.deleteTrigger(t));

  ScriptApp.newTrigger('onFormSubmit').forForm(form).onFormSubmit().create();
  Logger.log('Trigger installed for form: ' + form.getTitle());
}

/** Entry point. Fired by the form-submit trigger. */
function onFormSubmit(e) {
  try {
    Logger.log(describe(processResponse(e.response)));
  } catch (err) {
    Logger.log('FAILED: ' + err.stack);
    if (CONFIG.notifyOnFailure) notifyFailure(err);
    throw err; // keep the failure visible in the Apps Script execution log
  }
}

/**
 * Dev helper: replay the most recent submission without waiting for a new one.
 * Safe to re-run — a response that already has a branch is skipped.
 */
function testWithLatestResponse() {
  const responses = FormApp.getActiveForm().getResponses();
  if (!responses.length) throw new Error('This form has no responses yet.');
  Logger.log(describe(processResponse(responses[responses.length - 1])));
}

function describe(result) {
  if (result.action === 'created') return 'Opened ' + result.url;
  if (result.action === 'updated') return 'Updated ' + result.url + ' from the edited response.';
  return (
    'No change: ' + result.url + ' already matches this response. ' +
    'Close that pull request and delete its branch if you want a fresh one.'
  );
}

/**
 * Report how the form's current questions map onto post fields. Run this after
 * editing the form — it is the quickest way to see that a reworded question is
 * still understood, or that a new one has not stolen a field.
 *
 * Reads the most recent response so it can show real values; with no responses
 * yet it checks the question wording alone.
 */
function checkFormMapping() {
  const form = FormApp.getActiveForm();
  const responses = form.getResponses();
  const answers = responses.length
    ? collectSubmission(responses[responses.length - 1]).answers
    : questionTitlesOnly(form);
  const keys = Object.keys(answers);
  const sample = responses.length ? 'latest response' : 'question wording only (no responses yet)';

  const found = {
    speaker: findSpeakerKey(keys),
    title: findTitleKey(keys),
    abstract: findAbstractKey(keys),
    link: findLinkKey(answers, keys),
    permission: findPermissionKey(keys),
    audience: findAudienceKey(keys),
  };

  const lines = ['Form -> post field mapping, based on ' + sample + ':', ''];

  Object.keys(found).forEach((field) => {
    const key = found[field];
    if (!key) {
      lines.push(pad10(field) + '(no question matched)');
      return;
    }
    lines.push(pad10(field) + '"' + oneLine(key) + '"');
    if (responses.length) lines.push('          = ' + oneLine(String(answers[key])));
  });

  const fileItems = form.getItems(FormApp.ItemType.FILE_UPLOAD);
  lines.push(pad10('images') + (fileItems.length ? '"' + oneLine(fileItems[0].getTitle()) + '"' : '(no upload question)'));

  const problems = [];
  if (!found.speaker) problems.push('No question matched the speaker name — posts will say "Unknown speaker".');
  if (!found.title) problems.push('No question matched the talk title — posts will say "TODO: title".');
  if (!found.abstract) problems.push('No question matched the abstract — the post body will be a TODO.');
  if (!found.permission) problems.push('No permission question — uploaded images will always be committed.');
  if (!found.audience) problems.push('No audience question — `opento` falls back to the last-Friday house rule.');
  if (found.link && found.link === found.permission) {
    problems.push('The permission question is being used as the speaker link. Reword one of them.');
  }

  lines.push('', problems.length ? 'Check these:' : 'No problems found.');
  problems.forEach((p) => lines.push('  - ' + p));

  Logger.log(lines.join('\n'));
}

/** Question titles with empty answers, for checking a form that has no responses. */
function questionTitlesOnly(form) {
  const answers = {};
  form.getItems().forEach((item) => {
    const type = item.getType();
    if (type === FormApp.ItemType.PAGE_BREAK || type === FormApp.ItemType.SECTION_HEADER) return;
    answers[item.getTitle()] = '';
  });
  return answers;
}

/**
 * Bring the repo up to date with every response the form has, including ones
 * submitted before this script existed. Safe to re-run: a response that already
 * has a branch is updated in place, never duplicated.
 *
 * Apps Script stops a run after about six minutes. If that happens, just run it
 * again — it resumes where it left off.
 */
function processAllResponses() {
  const responses = FormApp.getActiveForm().getResponses();
  const counts = { created: 0, updated: 0, unchanged: 0, failed: 0 };

  responses.forEach((response, i) => {
    const label = i + 1 + '/' + responses.length + ' ';
    try {
      const result = processResponse(response);
      counts[result.action] += 1;
      Logger.log(label + describe(result));
    } catch (err) {
      counts.failed += 1;
      Logger.log(label + 'FAILED: ' + err.message);
    }
  });

  Logger.log(
    'Done. ' + counts.created + ' opened, ' + counts.updated + ' updated, ' +
    counts.unchanged + ' already current, ' + counts.failed + ' failed.'
  );
}

// ---------------------------------------------------------------------------
// Core
// ---------------------------------------------------------------------------

function processResponse(formResponse) {
  const submission = collectSubmission(formResponse);

  // The trailing hash is the identity; the name in front is only for humans, so a
  // speaker fixing a typo in their name still updates the same pull request.
  const existing = findSubmissionBranch(submission.id);
  const branch = existing || CONFIG.branchPrefix + '/' + submission.slug + '-' + submission.id;
  const isNew = !existing;

  if (isNew) createRef('refs/heads/' + branch, getRef('heads/' + CONFIG.baseBranch).object.sha);

  // Speakers are told they may edit their response after submitting, so a repeat
  // firing updates the open pull request rather than being ignored.
  const postPath =
    (isNew ? null : existingPostPath(branch, submission.surname)) ||
    CONFIG.postsDir + '/' + submission.date + '-' + submission.surname + '.md';

  const postChanged = putFileIfChanged(
    branch,
    postPath,
    Utilities.base64Encode(draftPost(submission), Utilities.Charset.UTF_8),
    (isNew ? 'Add' : 'Update') + ' talk by ' + submission.speaker
  );

  const imageNotes = commitImages(branch, submission);

  if (isNew) {
    const pr = createPullRequest(branch, submission, postPath, imageNotes, postsOnDate(submission.date));
    return { action: 'created', url: pr && pr.html_url };
  }

  const addedImages = imageNotes.filter((n) => n.added);
  const open = findOpenPullRequest(branch);
  const url = open ? open.html_url : 'branch ' + branch;

  if (!postChanged && !addedImages.length) return { action: 'unchanged', url: url };

  if (open && open.title !== pullRequestTitle(submission)) {
    githubRequest('PATCH', '/pulls/' + open.number, { title: pullRequestTitle(submission) });
  }

  if (open) {
    addPullRequestComment(
      open.number,
      '🔄 The speaker edited their form response, so this pull request has been updated.' +
        (postChanged ? '\n\n- `' + postPath + '` rewritten from the new answers' : '') +
        addedImages.map((n) => '\n- added ' + n.text).join('') +
        (postPath.slice(-(submission.surname.length + 4)) === '-' + submission.surname + '.md'
          ? ''
          : '\n- ⚠️ the speaker now gives their name as **' + submission.speaker +
            '**, but the file is still `' + postPath + '`. The page title is correct either way; ' +
            'only the URL slug is stale, so rename the file if that matters.')
    );
  }
  return { action: 'updated', url: url };
}

/**
 * The post file already on this branch, found by diffing against main, so an
 * edited response updates the original file instead of creating a second one.
 */
function existingPostPath(branch, surname) {
  const onMain = {};
  (listDir(CONFIG.postsDir, CONFIG.baseBranch) || []).forEach((n) => { onMain[n] = true; });
  const added = (listDir(CONFIG.postsDir, branch) || []).filter((n) => !onMain[n]);

  const bySurname = added.find((n) => n.slice(-(surname.length + 4)) === '-' + surname + '.md');
  const chosen = bySurname || (added.length === 1 ? added[0] : null);
  return chosen ? CONFIG.postsDir + '/' + chosen : null;
}

/** Pull everything out of the response without assuming any question names. */
function collectSubmission(formResponse) {
  const answers = {};
  const files = [];

  formResponse.getItemResponses().forEach((itemResponse) => {
    const item = itemResponse.getItem();
    const title = item.getTitle();
    const value = itemResponse.getResponse();

    // Never carry an email address into a public pull request. The form's own
    // "Email Address" column is Google's automatic one and does not appear here,
    // but a hand-added email question would — drop it either way.
    if (/e-?mail/i.test(title)) return;

    if (item.getType() === FormApp.ItemType.FILE_UPLOAD) {
      const ids = [].concat(value || []);
      ids.forEach((id) => files.push(id));
      answers[title] = ids.length + ' file(s) uploaded';
      return;
    }

    answers[title] = Array.isArray(value) ? value.join(', ') : value;
  });

  const submittedAt = formResponse.getTimestamp();
  const speaker = guessSpeaker(answers) || 'Unknown speaker';
  const talkDate = guessTalkDate(submittedAt);
  const permission = imagePermission(answers);
  const imagesAllowed = permission.allowed;
  const openTo = guessOpenTo(answers, talkDate);

  return {
    id: submissionKey(formResponse.getId()),
    submittedAt: submittedAt,
    speaker: speaker,
    surname: surnameOf(speaker),
    slug: slugify(speaker) || 'speaker',
    date: formatDate(talkDate),
    lastFridayOfMonth: isLastFridayOfMonth(talkDate),
    opento: openTo.value,
    opentoSource: openTo.source,
    opentoFromSpeaker: openTo.fromSpeaker,
    imagesAllowed: imagesAllowed,
    permissionAnswer: permission.answer,
    answers: answers,
    fileIds: imagesAllowed ? files : [],
    withheldFileCount: imagesAllowed ? 0 : files.length,
  };
}

/**
 * If the form asks who the talk is for, the speaker decides. Otherwise fall back
 * to the house rule: the last Friday of the month is open to everyone.
 *
 * Returns where the answer came from too, so the pull request can say which of
 * the two it was rather than implying the speaker chose.
 */
function guessOpenTo(answers, talkDate) {
  const key = findAudienceKey(Object.keys(answers));
  const value = key ? String(answers[key]).toLowerCase() : '';
  const fromSpeaker = 'the speaker\'s own answer on the form';

  if (/junior|restrict/.test(value)) return { value: 'juniors', source: fromSpeaker, fromSpeaker: true };
  if (/everyone|senior|all/.test(value)) return { value: 'everyone', source: fromSpeaker, fromSpeaker: true };

  return {
    value: isLastFridayOfMonth(talkDate) ? 'everyone' : 'juniors',
    source: 'the house rule (last Friday of the month is open to everyone) — the form has no audience question, so **check this one**',
    fromSpeaker: false,
  };
}

/**
 * Whether to commit the uploaded images, plus the answer verbatim.
 *
 * Note the form's permission question is about photographing the speaker at the
 * event, not about the files they chose to upload here. Withholding on "no" is
 * therefore cautious rather than strictly implied — the exact answer goes in the
 * pull request so the call stays yours.
 */
function imagePermission(answers) {
  const key = findPermissionKey(Object.keys(answers));
  if (!key) return { allowed: true, answer: '' };

  const answer = String(answers[key]).trim();
  return { allowed: !/^\s*no\b/i.test(answer), answer: answer };
}

/**
 * A stable, opaque branch key for one response.
 *
 * Hashing rather than truncating the Google response ID does two things: it cannot
 * collide because of where Google happens to put the entropy in that string, and it
 * keeps an internal Google identifier out of a public repo's branch names, which
 * outlive the branch itself in the pull request record.
 */
function submissionKey(responseId) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    String(responseId),
    Utilities.Charset.UTF_8
  );
  return bytes
    .slice(0, 8)
    .map((b) => ('0' + (b & 0xff).toString(16)).slice(-2))
    .join('');
}

/**
 * Which Friday this talk provisionally lands on.
 *
 * Submitted on a Monday  -> the Friday of that same week.
 * Submitted any other day -> the Friday of the following week.
 *
 * Always a guess: you reassign the slot when you know what else is booked.
 */
function guessTalkDate(submittedAt) {
  const tz = Session.getScriptTimeZone();
  const ymd = Utilities.formatDate(submittedAt, tz, 'yyyy-MM-dd').split('-').map(Number);
  const isoDay = parseInt(Utilities.formatDate(submittedAt, tz, 'u'), 10); // 1 = Monday .. 7 = Sunday

  // Noon UTC so that adding whole days can never trip over a DST boundary.
  const date = new Date(Date.UTC(ymd[0], ymd[1] - 1, ymd[2], 12));
  date.setUTCDate(date.getUTCDate() + (isoDay === 1 ? 4 : 12 - isoDay));
  return date;
}

function isLastFridayOfMonth(date) {
  const next = new Date(date.getTime());
  next.setUTCDate(next.getUTCDate() + 7);
  return next.getUTCMonth() !== date.getUTCMonth();
}

// --- Which question feeds which field -------------------------------------
// These are the only place question wording is interpreted. checkFormMapping()
// reports through the same functions, so it can never disagree with the code.

function findSpeakerKey(keys) {
  return keys.find((k) => /\bname\b/i.test(k) && !/talk|topic|title/i.test(k));
}

function findTitleKey(keys) {
  return keys.find((k) => /title|topic|subject/i.test(k));
}

function findAbstractKey(keys) {
  return keys.find((k) => /abstract|summary|descri|about/i.test(k));
}

function findPermissionKey(keys) {
  return keys.find((k) => /permission|consent/i.test(k));
}

function findAudienceKey(keys) {
  return keys.find((k) => /junior|restrict|open to every|audience/i.test(k));
}

/**
 * The first answer whose question mentions "name" is the speaker. Falls back to
 * the first short free-text answer so a renamed question does not break things.
 */
function guessSpeaker(answers) {
  const keys = Object.keys(answers);
  const named = findSpeakerKey(keys);
  if (named && answers[named]) return String(answers[named]).trim();

  const short = keys.find((k) => {
    const v = String(answers[k] || '').trim();
    return v && v.length < 60 && !v.includes('\n');
  });
  return short ? String(answers[short]).trim() : '';
}

/** Post filenames use the surname: "Nikki Arendse" -> "Arendse". */
/** "Nikki Arendse" -> "nikki-arendse", for readable branch names. */
function slugify(text) {
  return deaccent(text)
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 40);
}

function surnameOf(speaker) {
  const parts = String(speaker).trim().split(/\s+/);
  const last = deaccent(parts[parts.length - 1] || 'Speaker').replace(/[^A-Za-z-]/g, '');
  if (!last) return 'Speaker';
  return last.charAt(0).toUpperCase() + last.slice(1);
}

/** A post that only needs a human to check the date and tidy the prose. */
function draftPost(submission) {
  const a = submission.answers;
  const keys = Object.keys(a);

  const titleKey = findTitleKey(keys);
  const abstractKey = findAbstractKey(keys);
  const linkKey = findLinkKey(a, keys);

  const title = titleKey ? String(a[titleKey]).trim() : '';
  const abstract = abstractKey ? String(a[abstractKey]).trim() : '';
  const link = normaliseUrl(linkKey ? a[linkKey] : '');

  const lines = [
    '---',
    'layout: talk',
    'title:  ' + JSON.stringify(title || 'TODO: title'),
    'date:   ' + submission.date,
    'categories: talk',
    'speaker: ' + JSON.stringify(submission.speaker),
    'opento: ' + JSON.stringify(submission.opento),
  ];
  if (link) lines.push('link: ' + JSON.stringify(link));

  // Pin the image folder explicitly. auto_images.rb otherwise derives it from the
  // post date, so changing `date:` would silently drop every image.
  if (submission.fileIds.length) {
    lines.push('image_dir: ' + CONFIG.imageDir + '/' + submission.date);
  }
  lines.push('---', '');
  lines.push(abstract || 'TODO: abstract (the raw answers are in the pull request description)');
  lines.push('');

  return lines.join('\n');
}

function commitImages(branch, submission) {
  const dir = CONFIG.imageDir + '/' + submission.date;
  const present = {};
  (listDir(dir, branch) || []).forEach((n) => { present[n] = true; });

  const notes = [];

  submission.fileIds.forEach((id, i) => {
    try {
      const file = DriveApp.getFileById(id);
      const size = file.getSize();

      if (size > CONFIG.maxImageBytes) {
        notes.push({ added: false, text: '`' + file.getName() + '` (' + formatBytes(size) + ') too large, left in Drive: ' + file.getUrl() });
        return;
      }

      // Numeric prefix fixes carousel order, which auto_images.rb takes from the filename.
      const name = pad(i + 1) + '-' + sanitiseFilename(file.getName());
      const path = dir + '/' + name;
      const text = '`' + path + '` (' + formatBytes(size) + ')';

      if (present[name]) {
        notes.push({ added: false, text: text });
        return;
      }

      putFile(branch, path, Utilities.base64Encode(file.getBlob().getBytes()), 'Add image ' + name);
      notes.push({ added: true, text: text });
    } catch (err) {
      notes.push({ added: false, text: 'could not fetch Drive file `' + id + '`: ' + err.message });
    }
  });

  return notes;
}

/** Existing posts already sitting on this date, so a clash can be flagged. */
function postsOnDate(date) {
  const listing = githubRequest('GET', '/contents/' + CONFIG.postsDir + '?ref=' + CONFIG.baseBranch);
  if (!listing || !Array.isArray(listing)) return [];
  return listing
    .filter((entry) => entry.name.indexOf(date + '-') === 0)
    .map((entry) => entry.name);
}

function createPullRequest(branch, submission, postPath, imageNotes, clash) {
  const answerLines = Object.keys(submission.answers)
    .map((k) => '**' + k + '**\n\n' + blockquote(String(submission.answers[k])))
    .join('\n\n');

  const dayName = Utilities.formatDate(submission.submittedAt, Session.getScriptTimeZone(), 'EEEE');

  const body = [
    'Automated from a ScientiFika form submission on ' +
      Utilities.formatDate(submission.submittedAt, Session.getScriptTimeZone(), 'yyyy-MM-dd HH:mm') +
      ' (' + dayName + ').',
    '',
    '> [!WARNING]',
    '> This content was written by a member of the public and has not been reviewed.',
    '> Read it before merging.',
    '',
    '### The date is a guess',
    '',
    'Submitted on a ' + dayName + ', so this was placed on **' + submission.date + '**.' +
      (submission.lastFridayOfMonth ? ' That is the last Friday of the month.' : ''),
    '',
    clash.length
      ? '⚠️ **That Friday is already taken** by `' + clash.join('`, `') + '`, so this one needs moving.'
      : 'No other post currently sits on that date.',
    '',
    '**To change it:** open `' + postPath + '` in the *Files changed* tab, click the ✏️ pencil, ' +
      'edit the `date:` line, and commit to this branch.',
    '',
    'That single line is the whole change. Jekyll reads the date from it, not from the file name, ' +
      'and the images stay attached because the post pins them with `image_dir:`. ' +
      'Renaming the file to match is optional tidying — press <kbd>.</kbd> on this page for a ' +
      'browser editor if you want to do it.',
    '',
    '### Audience',
    '',
    '`opento` is set to `' + submission.opento + '` from ' + submission.opentoSource + '.',
    '',
    '### To do before merging',
    '',
    '- [ ] Confirm or change the date (see above)',
    submission.opentoFromSpeaker
      ? '- [ ] Check `opento` matches what the speaker asked for (quoted below)'
      : '- [ ] Set `opento` — it is `' + submission.opento + '` by the house rule only, since the form does not ask',
    '- [ ] Tidy the abstract',
    '- [ ] Check the title reads well',
    '',
    !submission.imagesAllowed
      ? '### Images\n\n🚫 Permission was declined, so ' + submission.withheldFileCount +
        ' uploaded file(s) were left in Drive rather than committed.\n\n' +
        'The answer was: ' + blockquote(submission.permissionAnswer) + '\n\n' +
        'Note that question is about photographing the talk itself, not about these uploads — ' +
        'add them by hand if that is what the speaker meant.'
      : imageNotes.length
      ? '### Images\n\n' + imageNotes.map((n) => '- ' + n.text).join('\n') +
        '\n\n`_plugins/auto_images.rb` picks these up from the folder named in `image_dir:` — ' +
        'one image becomes the card image, several become a carousel ordered by filename.'
      : '### Images\n\nNone uploaded.',
    '',
    '### Submitted answers',
    '',
    answerLines,
  ].join('\n');

  return githubRequest('POST', '/pulls', {
    title: pullRequestTitle(submission),
    head: branch,
    base: CONFIG.baseBranch,
    body: body,
    draft: true,
  });
}

// ---------------------------------------------------------------------------
// GitHub REST
// ---------------------------------------------------------------------------

function githubRequest(method, path, payload) {
  const token = PropertiesService.getScriptProperties().getProperty(CONFIG.tokenProperty);
  if (!token) {
    throw new Error(
      'No GitHub token. Add a Script Property named ' + CONFIG.tokenProperty + ' (see README.md).'
    );
  }

  const url = 'https://api.github.com/repos/' + CONFIG.owner + '/' + CONFIG.repo + path;
  const options = {
    method: method,
    contentType: 'application/json',
    muteHttpExceptions: true,
    headers: {
      Authorization: 'Bearer ' + token,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  };
  if (payload) options.payload = JSON.stringify(payload);

  const response = UrlFetchApp.fetch(url, options);
  const code = response.getResponseCode();
  const text = response.getContentText();

  if (code === 404 && method === 'GET') return null;
  if (code < 200 || code >= 300) {
    throw new Error('GitHub ' + method + ' ' + path + ' failed (' + code + '): ' + text);
  }
  return text ? JSON.parse(text) : null;
}

function getRef(ref) {
  const result = githubRequest('GET', '/git/ref/' + ref);
  if (!result) throw new Error('Ref not found: ' + ref);
  return result;
}

function refExists(ref) {
  return githubRequest('GET', '/git/ref/' + ref) !== null;
}

function createRef(ref, sha) {
  return githubRequest('POST', '/git/refs', { ref: ref, sha: sha });
}

/** File names in a directory on a branch, or null if the directory is absent. */
function listDir(path, ref) {
  const listing = githubRequest('GET', '/contents/' + encodePath(path) + '?ref=' + encodeURIComponent(ref));
  if (!listing || !Array.isArray(listing)) return null;
  return listing.map((entry) => entry.name);
}

/** Writes only when the content differs. Returns whether anything was written. */
function putFileIfChanged(branch, path, base64Content, message) {
  const existing = githubRequest('GET', '/contents/' + encodePath(path) + '?ref=' + encodeURIComponent(branch));

  if (existing && existing.content) {
    const same = String(existing.content).replace(/\s+/g, '') === String(base64Content).replace(/\s+/g, '');
    if (same) return false;
    putFile(branch, path, base64Content, message, existing.sha);
    return true;
  }

  putFile(branch, path, base64Content, message);
  return true;
}

/** The branch already holding this response, matched on the hash, or null. */
function pullRequestTitle(submission) {
  return 'Talk by ' + submission.speaker + ' (' + submission.date + ')';
}

function findSubmissionBranch(key) {
  const refs = githubRequest('GET', '/git/matching-refs/heads/' + CONFIG.branchPrefix + '/');
  if (!refs || !refs.length) return null;

  const suffix = '-' + key;
  const match = refs.find((r) => r.ref.slice(-suffix.length) === suffix);
  return match ? match.ref.replace('refs/heads/', '') : null;
}

function findOpenPullRequest(branch) {
  const open = githubRequest(
    'GET',
    '/pulls?state=open&head=' + encodeURIComponent(CONFIG.owner + ':' + branch)
  );
  return open && open.length ? open[0] : null;
}

function addPullRequestComment(number, body) {
  githubRequest('POST', '/issues/' + number + '/comments', { body: body });
}

function putFile(branch, path, base64Content, message, sha) {
  const payload = { message: message, content: base64Content, branch: branch };
  if (sha) payload.sha = sha;
  if (CONFIG.commitAuthor) {
    payload.author = CONFIG.commitAuthor;
    payload.committer = CONFIG.commitAuthor;
  }
  return githubRequest('PUT', '/contents/' + encodePath(path), payload);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date) {
  return Utilities.formatDate(date, 'UTC', 'yyyy-MM-dd');
}

/**
 * Which answer holds the speaker's homepage.
 *
 * Matching the question text alone is fragile: the photo-permission question
 * says "on our website, social media …" and would win on wording. So a
 * candidate only counts if its answer actually looks like a URL, and failing
 * that any URL-shaped answer is used.
 */
function findLinkKey(answers, keys) {
  const social = /instagram|social|twitter|mastodon|bluesky|facebook/i;
  const asks = /website|webpage|homepage|url|link/i;

  const named = keys.find((k) => asks.test(k) && !social.test(k) && looksLikeUrl(answers[k]));
  if (named) return named;

  return keys.find((k) => !social.test(k) && looksLikeUrl(answers[k]));
}

/** A bare domain, or anything with a scheme. Deliberately strict: no spaces. */
function looksLikeUrl(value) {
  const v = String(value || '').trim();
  if (!v || /\s/.test(v)) return false;
  return /^https?:\/\//i.test(v) || /^[\w-]+(\.[\w-]+)+(\/\S*)?$/.test(v);
}

/**
 * A scheme-less href in the talk template resolves relative to the page, so
 * "www.example.com" silently becomes a 404. Always emit an absolute URL.
 */
function normaliseUrl(value) {
  const url = String(value || '').trim();
  if (!url) return '';
  return /^https?:\/\//i.test(url) ? url : 'https://' + url.replace(/^\/+/, '');
}

function encodePath(path) {
  return path.split('/').map(encodeURIComponent).join('/');
}

function deaccent(text) {
  return String(text).normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function sanitiseFilename(name) {
  return String(name).replace(/[^A-Za-z0-9._-]+/g, '_').slice(-80);
}

function pad10(text) {
  return (text + '          ').slice(0, 10) + ' ';
}

function oneLine(text) {
  const t = String(text).replace(/\s+/g, ' ').trim();
  return t.length > 70 ? t.slice(0, 67) + '...' : t;
}

function pad(n) {
  return n < 10 ? '0' + n : String(n);
}

function formatBytes(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function blockquote(text) {
  return String(text)
    .split('\n')
    .map((line) => '> ' + line)
    .join('\n');
}

function notifyFailure(err) {
  try {
    const email = Session.getEffectiveUser().getEmail();
    if (!email) return;
    MailApp.sendEmail(
      email,
      'ScientiFika form -> GitHub failed',
      'A form submission could not be pushed to GitHub.\n\n' + err.stack
    );
  } catch (ignored) {
    // Notification is best-effort; never mask the original error.
  }
}

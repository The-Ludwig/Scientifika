# Form → pull request (Google Apps Script)

`Code.gs` runs inside the speaker form's Apps Script project. On every submission it
opens a **draft pull request** against this repo containing:

- `_posts/YYYY-MM-DD-Surname.md` — a complete post: front matter filled in, abstract verbatim
- `assets/images/talks/YYYY-MM-DD/NN-<file>` — any images the speaker uploaded

That's the real layout, not a staging area, so a PR is mergeable as-is once you've
read it. Every raw answer except the email address is reproduced in the PR description
rather than committed as a file. Nothing is written to `main`.

The script never hard-codes question names — it reads whatever the form currently
asks — so you can add or rename questions without touching it.

## How the date is chosen

| Submitted on | Talk date |
| --- | --- |
| Monday | the Friday of that same week (+4 days) |
| Tuesday–Sunday | the Friday of the following week |

So everything submitted Tuesday through Sunday converges on the same Friday, and a
Monday submission gets the short turnaround.

It is only a guess — you decide the real slot. The PR says which day it was submitted
and which Friday that produced, and **warns you if a post already sits on that date**.

### Changing the date is a one-line edit

Jekyll takes the post's date from the `date:` front matter, not the filename, so
editing that one line in GitHub's web editor is enough — the renamed file is purely
cosmetic. Posts with images also get an explicit `image_dir:`, because
`_plugins/auto_images.rb` otherwise derives the folder from the date and the images
would silently disappear the moment you changed it. With `image_dir` pinned they
survive.

If you do want to tidy filenames, press `.` on any GitHub repo or pull request page:
that opens github.dev, a browser VS Code where renaming a file or folder and
committing to the branch takes seconds.

## What it reads from the form

Nothing is hard-coded to a question's exact wording; each field is found by matching
the question text, so you can reword questions freely.

| Post field | Taken from |
| --- | --- |
| `title` | the question mentioning *title/topic/subject* |
| `speaker` | the question mentioning *name* |
| abstract | the question mentioning *abstract/summary/description* |
| `opento` | the speaker's answer about junior-only vs. open to everyone, **if the form still asks**; otherwise the house rule |
| `link` | the question mentioning *webpage/website/URL* whose answer actually looks like a URL |
| images | the file-upload question, **only if** the permission question was not answered "no" |

**The form currently has no audience question**, so `opento` always comes from the
house rule — `everyone` on the last Friday of the month, `juniors` otherwise — and
every pull request says so and asks you to check it. Put the question back on the
form if you'd rather the speaker decided.

Matching on question text alone is not enough for the link: the photo-permission
question contains the words "on our website", so it would otherwise win. A candidate
only counts if its answer looks like a URL, and social-media questions are excluded
outright.

### Email addresses are never committed

The form collects an email address. Any answer whose question mentions *email* is
dropped before anything is written, so it reaches neither the post nor the pull
request description. This matters because the repo — and therefore every PR body —
is public.

### URLs are made absolute

Speakers type `www.example.com` as often as `https://www.example.com`. A scheme-less
value in `link:` renders as `<a href="www.example.com">`, which the browser resolves
relative to the current page and turns into a 404, so `https://` is added when it's
missing.

### Photo permission

If the permission answer begins with "no", the uploaded files are left in Drive and
the pull request says so prominently, quoting the answer verbatim.

Worth knowing: that question asks about **photographing the speaker at the event**,
not about the files they uploaded here. Withholding the uploads is therefore cautious
rather than strictly implied — the pull request says as much, so you can add them back
if that is clearly what the speaker meant. The partial answers ("my photo, but not the
slides") are not interpreted; they are quoted for you to read.

### Branch names

Each submission gets `submission/nikki-arendse-b4d43b0caf834edd`: the speaker's name
for you to read, then 16 hex characters of a SHA-256 of the Google Forms response ID.

**Only the hash counts as identity.** A repeat firing finds the branch by matching that
suffix, so a speaker who corrects a typo in their own name updates the same pull request
instead of opening a second one. The branch keeps its original spelling in that case —
the pull request title is refreshed, and a comment points out that the post's file name,
and therefore its URL slug, still carries the old spelling.

It hashes the response ID rather than using it directly for two reasons: truncating that
ID risked collisions, where one submission would silently overwrite another; and an
internal Google identifier stays out of a public repo, where branch names outlive the
branch itself in the pull request record. The identifier was never a credential —
reading a response through the Forms API needs authorisation — but there was no reason
to publish it.

### Edited responses

The form invites speakers to edit after submitting, and to send a finalised title and
abstract a week before the talk. When that happens the script **updates the existing
pull request** instead of ignoring the change or opening a second one: the post file is
rewritten, images already committed are not re-uploaded, and a comment is added saying
what changed. If nothing changed, nothing is written and no comment appears.

## Setup

### 1. Mint a GitHub token

At https://github.com/settings/personal-access-tokens/new create a **fine-grained**
personal access token:

- **Resource owner:** your account
- **Repository access:** *Only select repositories* → `The-Ludwig/Scientifika`
- **Permissions:** `Contents` → Read and write, `Pull requests` → Read and write
- **Expiration:** whatever you'll remember to rotate; the script emails you when it breaks

Nothing else. In particular it does not need `Administration`, so the token cannot
change branch protection.

### 2. Paste the script in

1. Open the form → ⋮ → **Apps Script**.
2. Replace the contents of `Code.gs` with this file's `Code.gs`.
3. **Project Settings** → **Script Properties** → add:
   - Property: `GITHUB_TOKEN`
   - Value: the token from step 1

   Script Properties are not visible to people filling in the form, and are not in
   this repo.

### 3. Authorise and install the trigger

1. In the editor, select `installTrigger` and press **Run**.
2. Google will ask you to authorise: form access, Drive (to read uploaded images),
   external requests (to reach GitHub), and mail (failure notices). Accept.
3. The log should say `Trigger installed for form: …`.

Check **Project Settings → Time zone** is Europe/Stockholm; the weekday rule above is
evaluated in the script's time zone.

### 4. Test it

Run `testWithLatestResponse`. It replays your most recent real submission and logs
the PR URL. Re-running is safe — a response that already has a branch is skipped,
so you can't create duplicates.

If there are no responses yet, submit the form once yourself.

## Image credits

Any post with an image shows "Image(s) provided by the speaker." beneath it. That is the
default because it is true of everything the form produces, so new posts need no extra
front matter.

Two escape hatches, for images that did not come from the speaker:

```yaml
img_credit: none                      # no caption at all
img_credit: "Photo by Katy Proctor."  # any wording you like
```

Already marked `none`: the Christmas event, ScientiFikART, Ask-Each-Other-Anything, and
FysikShow — ScientiFika's own events rather than a speaker's material.

## Keeping the script and the form in sync

The script finds each field by matching question wording, so editing the form can
quietly change what it picks up. Run this from the Apps Script editor, like
`testWithLatestResponse`.

### `checkFormMapping()` — run this after every form edit

Prints which question currently feeds each post field, with the value from the most
recent response, and warns about anything missing or ambiguous:

```
speaker    "Name:"
          = Nikki Arendse
title      "Title of your talk"
          = Hunting for strongly lensed supernovae with the Vera Rubin Observatory
abstract   "Abstract (200 words or less)"
          = When a supernova explodes behind a massive galaxy, its light can be...
link       "If wanted, you may add a URL to e.g. a personal webpage or a depart..."
          = www.nikkiarendse.com
permission "May we have your permission to post your photo--- including a view ..."
audience   (no question matched)
images     "Please upload your photo and/or an image representative of your tal..."

Check these:
  - No audience question — `opento` falls back to the last-Friday house rule.
```

It reports through the same functions the script itself uses, so it cannot drift out
of agreement with the real behaviour.

Rewording matters more than it looks. Renaming "Title of your talk" to "What will you
speak about?" loses the title *and* hijacks the abstract, because "about" matches the
abstract pattern. The mapping report shows that immediately.

## Notes

- **Submitted content is untrusted.** It's written by strangers and lands in a public
  repo. Read a PR before merging it; the description carries a warning to that effect.
- **Merging is what publishes it, but the branch is already visible** — this repo is
  public, so an unmerged submission is readable by anyone who looks. Close and delete
  the branch for submissions you don't intend to use.
- **The surname is the last word of the name**, deaccented for the filename while
  `speaker:` keeps the original spelling. Multi-word surnames like "Prat i Solà" come
  out as `Sola`; rename the file if that matters.
- **Images over 8 MB** are not committed; the PR links to them in Drive instead. Change
  `maxImageBytes` in `CONFIG` if you'd rather have them in git.
- **Commits are attributed to** `CONFIG.commitAuthor` — "ScientiFika Form" by default,
  rather than your own name. Set it to `null` to use the token owner instead. The pull
  request itself is still opened by whoever owns the token; that cannot be changed
  without a separate GitHub account.
- **Failures** are logged under **Executions** in the Apps Script editor, and emailed to
  you. Set `notifyOnFailure: false` to stop the mail.
- **Token expiry** is the most likely future breakage. When it expires, submissions stop
  producing PRs and you get an email; mint a new token and update the Script Property.

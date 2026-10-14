# Broke Compass

Zarar Mahmud's travel journal — field notes and photo journals from Sikkim, Bali, Nepal, and wherever's next.

No build step and nothing to install. `index.html` holds the markup;
the styles live in `assets/css/` as small files, linked through a single
`main.css`. Bootstrap 5's CSS (no Bootstrap JS) is loaded from the jsDelivr
CDN ahead of `main.css`. Every page sits in a Bootstrap `.container-fluid`,
so the layout spans the full width of the screen, and Bootstrap's utility
classes are there if you want them. The site's own styles load second and
win any tie. Open `index.html` directly in a browser, or edit any of it in a
text editor. (The quiz pages are the one exception: they load their data
with JavaScript modules, which browsers won't run from `file://`. See
[Quiz](#quiz).)

## Project structure

```
index.html                  markup only — no inline styles
404.html                    "Lost the trail": served for any missing page
sitemap.xml                 every published page, for search engines
robots.txt                  points crawlers at the sitemap
assets/
  js/
    compass.js              the hero compass needle, pulled toward the cursor like a magnet
    quiz/
      api.js                read-only Firebase Realtime Database access (REST, no SDK)
      page.js               shared by the quiz pages: the loader and the empty state
      hub.js                quiz/index.html: lists the quizzes
      play.js               quiz/play.html: one question per screen, saves progress
      result.js             quiz/result.html: the result, plus download/share
      postcard.js           draws a result as a postcard on a canvas (JPEG)
      random-quiz.js        post sidebars: swaps in a random quiz
  icons/                    favicon.svg, favicon-32.png, apple-touch-icon.png
  images/
    og-card.png             1200×630 preview shown when a link is shared
    mountain_lover_quiz/    result_1.webp … result_15.webp, one per quiz result
    compass.svg             the homepage compass, as the quiz loading spinner
    compass-lost.svg        "Lost the trail": the 404 page and the quiz error state
  css/
    main.css                the site's stylesheet (after Bootstrap); @imports the rest, in order
    base/
      tokens.css            colours, fonts, radii, timings — change a value here, it propagates
      reset.css             page background, paper grain, focus ring, Bootstrap Reboot fixes
      typography.css        shared type treatments (.label, .section-lede)
    layout/
      wrap.css              gutter and stacking for the .container-fluid wrapper
      header.css            sticky masthead
      hero.css              opening spread + compass
      footer.css            closing band
    components/
      section-head.css      section title + running note
      entry-grid.css        two-column entry board and column heads
      entry-card.css        a single journal entry card
      divider.css           the route-line section break
      about.css             about spread + pull quote
      social.css            social stamps
      post.css              post page: header, prose, previous/next links
      part-list.css         the list of parts on a series page (also the quiz cards)
      post-aside.css        the sidebar beside a post: other journals, a quiz
      button.css            brass pill buttons and their ghost variant
      lost-trail.css        "Lost the trail" box: the 404 page and quiz errors
      quiz.css              quiz questions, result spread, postcard
    utilities/
      a11y.css              .visually-hidden, reduced-motion
quiz/
  index.html                quiz hub: every quiz in the database
  play.html                 ?quiz=N, the quiz itself
  result.html               ?id=N, one result; shareable, not indexed
data/                       Firebase exports (git-ignored, never deployed)
posts/
  abc-trek/
    index.html              series page: every published part, with a teaser
    part-1.html … part-4.html
  text_posts/               raw drafts the post pages are made from (git-ignored)
```

## Editing

- **Colours and fonts** — `assets/css/base/tokens.css`. Everything else reads
  from these variables, so changing `--brass` restyles every accent on the site.
- **A blog entry** — each is an `<a class="entry">` block inside one of the two
  `<div class="entries-col">` columns ("Field Notes" or "Photo Journal") under
  `<section id="entries">` in `index.html`. Copy an existing one and change the
  title, location, tags, and excerpt.
- **The About section** — `<section id="about">` in `index.html`.
- **Socials** — the `<footer id="contact">` in `index.html`.
- **How something looks** — find the component file in `assets/css/components/`
  whose name matches the thing you're changing.

Two conventions worth knowing:

- `class="label"` is the uppercase mono treatment used by every small label on
  the site (nav links, card meta, tag pills, footer notes). Add it to anything
  that should match; the component file adjusts size and colour from there.
- Decorative SVGs carry `class="icon" aria-hidden="true"` and use
  `stroke="currentColor"`, so they take their colour from whatever contains them.

## Deploying (GitHub Pages — free)

1. **Create a GitHub account** if you don't have one: [github.com/join](https://github.com/join)

2. **Create a new repository**
   - Go to [github.com/new](https://github.com/new)
   - Name it whatever you like (e.g. `broke-compass`)
   - Keep it **Public** (required for free GitHub Pages)
   - Don't initialize with a README (this repo already has one)

3. **Push this folder to your new repo.** From inside this folder, run:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git push -u origin main
   ```

4. **Turn on GitHub Pages**
   - In your repo, go to **Settings → Pages**
   - Under "Build and deployment," set **Source** to `Deploy from a branch`
   - Set **Branch** to `main` and folder to `/ (root)`
   - Save

5. **Wait about a minute.** Your site goes live at:
   ```
   https://YOUR_USERNAME.github.io/YOUR_REPO_NAME/
   ```
   GitHub shows you this exact URL at the top of the Pages settings once it's ready.

From then on, any time you edit `index.html` and run:
```
git add .
git commit -m "describe your change"
git push
```
the live site updates automatically within a minute or two — no redeploy step, no server to manage.

## Optional: a cleaner free URL

`username.github.io/repo-name` works fine, but if you want something shorter:

- **Rename the repo to `YOUR_USERNAME.github.io`** (exactly that, as your only "user site"). Then your site becomes `https://YOUR_USERNAME.github.io` with no extra path. You get one of these per GitHub account.
- **A free subdomain** via [is-a.dev](https://www.is-a.dev/) — you submit a small pull request, and once merged you get something like `brokecompass.is-a.dev` pointing at your GitHub Pages site. Free, no ads, no catch, just takes a day or two for the PR to be reviewed.
- Cloudflare Pages, Netlify, and Vercel are also free and support GitHub auto-deploy the same way, with their own free subdomains (`.pages.dev`, `.netlify.app`, `.vercel.app`) if you'd rather not use GitHub Pages.

## Post pages

The ABC trek is the first entry with real pages: `posts/abc-trek/index.html`
lists every published part with a short teaser, and each part has its own
page (`part-1.html`, `part-2.html`, …) with previous/next links at the foot.
The homepage card links to the series page.

The raw story lives in `posts/text_posts/abc_trek.txt`, which is git-ignored so unfinished text never reaches the live site. Each finished part
ends with a long line of hyphens; anything after the last line of hyphens is
still a draft and isn't published. To add a part, copy the last part page,
change the title, route, read time and prose, link it from the series page,
and point the previous part's "next" link at it. Then update its SEO tags
(see below) and add it to `sitemap.xml`.

**Layout.** Under the full-width header, a post page splits into two
Bootstrap columns: the story in `col-lg-8`, and a sidebar in `col-lg-4`
(`<aside class="post-aside">`). They stack on screens narrower than 992px.
The sidebar lists the *other* journals (never the one you're reading), then
a "Take a quiz" card. That card links to the quiz hub in the HTML, and
`random-quiz.js` swaps in a random quiz from the database.

The sidebar is plain HTML, copied into every post page like the header and
footer. When a journal gets its own page, update its sidebar entry on the
*other* journals' pages: change `<div class="aside-journal">` to
`<a class="aside-journal" href="…">` and drop the "Coming soon" pill. A new
journal also needs adding to every other journal's sidebar.

The other homepage cards still link to `#`. Their pages can follow the same
shape under `posts/` (e.g. `posts/sikkim.html`).

## Quiz

Quizzes live in Firebase Realtime Database and are read through its REST
API, so there's no SDK, no API key and no build step. The database URL is
the `DB_URL` constant at the top of `assets/js/quiz/api.js`.

**Data shape.** Five collections, each keyed by id, every row carrying a
`quiz_id`:

| collection       | fields                                                |
| ---------------- | ----------------------------------------------------- |
| `quizzes`        | `quiz_id`, `title`, `image_dir`                       |
| `questions`      | `question_id`, `quiz_id`, `title`                     |
| `options`        | `question_id`, `quiz_id`, `text`, `score`             |
| `score_mappings` | `quiz_id`, `min_score`, `max_score`, `result_id`      |
| `results`        | `result_id`, `quiz_id`, `title`, `description`, `image_url` |

A reader's answers are added up, and the score band they fall in picks the
result. Options are shuffled on screen, so their order never gives the
scoring away.

**Rules.** Reads are public, writes are closed, and each collection is
indexed on `quiz_id` so a quiz's rows come back in one filtered request:

```json
{
  "rules": {
    ".read": true,
    ".write": false,
    "questions":      { ".indexOn": "quiz_id" },
    "options":        { ".indexOn": "quiz_id" },
    "results":        { ".indexOn": "quiz_id" },
    "score_mappings": { ".indexOn": "quiz_id" }
  }
}
```

**Images.** `image_url` is relative to `assets/images/`, e.g.
`mountain_lover_quiz/result_7.webp`. Result images are WebP (quality ~80,
around 130 KB each). Convert new ones with
`convert in.jpeg -strip -quality 80 out.webp`. `og-card.png` and the icons
stay PNG, because social-preview crawlers and iOS home-screen icons need PNG
or JPEG.

**Adding a quiz.** Add the rows in the Firebase console (or import JSON),
put its images in `assets/images/<image_dir>/`, and it shows up on the hub
by itself. Keep exports in `data/`. It's git-ignored because an export is
the answer key.

**Postcards.** The result page draws a 1800px-wide landscape postcard on a
canvas (illustration on top, result underneath, stamp and postmark), shows
a preview, and offers Download, Share (the phone's share sheet, where it
supports files) and Copy link.

**Loading and errors.** While a quiz page waits on the database, it shows
the compass spinner (`.quiz-loader`), which turns and breathes in and out
and holds still for reduced motion. If loading fails for any reason, the
page shows the "Lost the trail" empty state (`.lost-trail`) with the reason.
A dropped connection or server error gets a Try again button. Missing data
(a bad link, an empty quiz) gets a way back instead, since retrying won't
help. `load()` in `page.js` wires both, so a new quiz page only needs the
two blocks of markup from `quiz/play.html`.

**Running it locally.** Serve the folder over http, e.g.
`python3 -m http.server`, then open `http://localhost:8000/quiz/`.

## Accessibility

The site targets **WCAG 2.2 AA** throughout:

- Every text colour in `tokens.css` reaches at least 4.5:1 on every
  surface, including `--bark-2`, the lightest. `--rust` doesn't, so it's
  for decoration only (rules, rivets), never text. Re-check the ratios
  before changing a colour.
- Every page has a "Skip to content" link, a `<main id="main">` landmark,
  and `aria-current="page"` on the nav link for the section you're in.
- Links that open a new tab say so to screen readers.
- The masthead stops being sticky on narrow screens, where it wraps too
  tall to stay pinned without covering content.
- The quiz uses native radio buttons in a fieldset. Focus moves to each
  new question, errors are announced, and every control is at least 44px.
- Motion respects `prefers-reduced-motion` (`utilities/a11y.css`).

## SEO

The quiz hub (`quiz/`) is indexed and in the sitemap. `play.html` and
`result.html` are `noindex`, since their content comes from the database.

Every page's `<head>` carries, in this order:

- `<title>` (under ~60 characters) and `<meta name="description">` (under ~160)
  — these are what show up in a Google result, so lead with what people search
  for ("ABC trek", "Annapurna Base Camp", place names).
- `<meta name="keywords">`. Google ignores this tag; it's there for the smaller
  engines that still read it. Don't stuff it.
- `<link rel="canonical">` — the page's one true absolute URL.
- Favicons, then Open Graph and Twitter/X tags, which decide the preview card
  on Facebook, WhatsApp, X and LinkedIn. All pages share `assets/images/og-card.png`.
- A `<script type="application/ld+json">` block of schema.org structured data:
  `WebSite` + `Person` + `Blog` on the homepage, `CollectionPage` + breadcrumbs
  on a series page, `BlogPosting` + breadcrumbs on each part.

When copying a part page, change every one of those: title, description,
keywords, canonical, `og:`/`twitter:` title, description and URL, the
`article:tag`s, and the JSON-LD (headline, description, URLs, `wordCount`,
`timeRequired`, places, and the third breadcrumb). Add the series page's
`ItemList` entry for it too.

**`404.html`** is what Netlify (and GitHub Pages) serve for any URL that
doesn't exist, at any depth, so its links and assets are root-absolute
(`/assets/…`). That works while the site sits at the root of its domain; it
won't style when opened from the file system, and it would need its paths
prefixed if the site ever moved under a subfolder. It's `noindex` and stays
out of `sitemap.xml`.

**The site lives at `https://broke-compass.netlify.app/`.** Canonical, Open
Graph, JSON-LD and sitemap URLs are all absolute and built on that address. If
it moves (a custom domain, say), find-and-replace it across `*.html`,
`sitemap.xml` and `robots.txt`; stale absolute URLs do more harm than none.

After deploying:

1. Add `https://broke-compass.netlify.app/` in
   [Google Search Console](https://search.google.com/search-console) as a
   URL-prefix property, and verify with the HTML-tag method: paste the
   `<meta name="google-site-verification">` tag into `index.html`'s `<head>`.
2. Under **Sitemaps**, submit `sitemap.xml`. Do the same in
   [Bing Webmaster Tools](https://www.bing.com/webmasters), which also feeds DuckDuckGo
   and Yahoo.
3. Check each page with Google's [Rich Results Test](https://search.google.com/test/rich-results).

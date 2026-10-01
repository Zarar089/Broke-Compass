# Broke Compass

Zarar Mahmud's travel journal — field notes and photo journals from Sikkim, Bali, Nepal, and wherever's next.

No build step, no dependencies, no framework. `index.html` holds the markup;
the styles live in `assets/css/` as small files, linked through a single
`main.css`. Open `index.html` directly in a browser, or edit any of it in a
text editor.

## Project structure

```
index.html                  markup only — no inline styles
assets/
  css/
    main.css                the only stylesheet index.html links; @imports the rest, in order
    base/
      tokens.css            colours, fonts, radii, timings — change a value here, it propagates
      reset.css             box-sizing, page background, paper grain, focus ring
      typography.css        shared type treatments (.label, .section-lede)
    layout/
      wrap.css              the centred content column
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
      part-list.css         the list of parts on a series page
    utilities/
      a11y.css              .visually-hidden, reduced-motion
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
and point the previous part's "next" link at it.

The other homepage cards still link to `#`. Their pages can follow the same
shape under `posts/` (e.g. `posts/sikkim.html`).

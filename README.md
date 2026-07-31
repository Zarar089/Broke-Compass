# Broke Compass

Zarar Mahmud's travel journal — field notes and photo journals from Sikkim, Bali, Nepal, and wherever's next.

This is a single static HTML file (`index.html`) with all CSS and SVG icons inline. No build step, no dependencies, no framework. Open it directly in a browser, or edit it in any text editor.

## Editing

Everything lives in `index.html`:

- Colors and fonts are set as CSS variables near the top of the `<style>` block (`--ink`, `--bark`, `--brass`, etc.)
- Each blog entry is an `<a class="entry">` block inside either the "Field Notes" or "Photo Journal" column under `<section id="entries">`
- The About section is under `<section id="about">`
- Socials are in the `<footer id="contact">`

Open the file, find the text you want to change, edit it, save, and push — that's the whole workflow.

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

## Adding real blog post pages later

Right now the entry cards on the homepage link to `#` (they don't go anywhere yet). When you're ready to build out individual post pages, the natural structure is:

```
/
  index.html          (this file)
  /posts/
    sikkim.html
    bali.html
    nepal-2025.html
    abc-trek.html
```

Then update each entry's `href="#"` to point at, e.g., `href="posts/sikkim.html"`. Happy to build those out whenever you're ready — I've still got your full Sikkim writeup and the ABC trek series saved.

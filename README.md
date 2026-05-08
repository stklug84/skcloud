# skcloud — steffenklug.cloud

Personal site of **Steffen Klug, Cloud Architect** — a Jekyll-based website
deployed to GitHub Pages at <https://steffenklug.cloud>.

The site is intentionally small, fast, and dependency-light: plain Jekyll +
hand-written HTML/CSS/JS, no Node.js build step, no Sass pipeline, no JS
framework. It uses only plugins that are whitelisted by GitHub Pages so the
site can be built directly by GitHub's hosted Jekyll action.

> **TL;DR**
> 1. Fork / clone the repo.
> 2. Edit content as Markdown files in `_posts/`, `_projects/`, `_architectures/`, `_books/`, or `_data/cv.yml`.
> 3. Push to `main` → production at `/`. Push to `develop` → canary preview at `/canary/`.

---

## Table of contents

- [Site sections](#site-sections)
- [Architecture overview](#architecture-overview)
- [Repository layout](#repository-layout)
- [Content model](#content-model)
  - [Blog posts](#blog-posts)
  - [Projects](#projects)
  - [Architectures & Diagrams](#architectures--diagrams)
  - [Books & Trainings](#books--trainings)
  - [CV / scrollorama](#cv--scrollorama)
- [Styling and theming](#styling-and-theming)
- [JavaScript behavior](#javascript-behavior)
- [Build and deployment](#build-and-deployment)
  - [GitHub Pages workflows](#github-pages-workflows)
  - [Canary deployment](#canary-deployment)
  - [Local development](#local-development)
- [Configuration reference](#configuration-reference)
- [Custom domain (CNAME)](#custom-domain-cname)
- [Accessibility & performance notes](#accessibility--performance-notes)
- [Roadmap / nice-to-haves](#roadmap--nice-to-haves)

---

## Site sections

The site is organized around five top-level sections, each linked from the
header navigation defined in `_config.yml` (`site.nav`):

| Section                  | URL              | Backed by                    | Index file                  |
| ------------------------ | ---------------- | ---------------------------- | --------------------------- |
| Home                     | `/`              | `index.html`                 | `index.html`                |
| Blog                     | `/blog/`         | `_posts/*.md`                | `blog/index.html`           |
| Projects                 | `/projects/`     | `_projects/*.md` collection  | `projects/index.html`       |
| Architectures & Diagrams | `/architectures/`| `_architectures/*.md` coll.  | `architectures/index.html`  |
| Books & Trainings        | `/books/`        | `_books/*.md` collection     | `books/index.html`          |
| CV                       | `/cv/`           | `_data/cv.yml`               | `cv/index.html`             |
| Impressum                | `/impressum/`    | `site.legal` in `_config.yml`| `impressum/index.html`      |
| Datenschutz              | `/datenschutz/`  | `site.legal` in `_config.yml`| `datenschutz/index.html`    |

The CV uses a YAML data file (instead of a collection) because all roles are
rendered on a single scrolling page — there are no per-role detail pages.

The Impressum and Datenschutz pages are bilingual (German legally binding,
English translation) and EU-compliant for a private, non-commercial site
hosted on GitHub Pages. They read all personal data from `site.legal` in
`_config.yml` — fill in `name`, `street`, `postal_code`, `city`, `email`
**before going live**. Empty fields render as `TODO …` placeholders so it's
obvious what still needs filling in.

---

## Architecture overview

```
                        ┌──────────────────────────────────────┐
                        │           GitHub repository          │
                        │              (main / develop)        │
                        └───────────────────┬──────────────────┘
                                            │
                                            ▼
                ┌────────────────────────────────────────────────┐
                │   GitHub Actions (.github/workflows/*)         │
                │                                                │
                │   • smart-canary-deployment.yml  (default)     │
                │       - Builds main      → _site/              │
                │       - Builds develop   → _site/canary/       │
                │       - Injects "🐣 Canary" badge on canary    │
                │       - Caches _site between runs              │
                │                                                │
                │   • jekyll-gh-pages.yml (manual fallback)      │
                │       - Plain build of main only               │
                └───────────────────┬────────────────────────────┘
                                    │  upload-pages-artifact
                                    ▼
                        ┌────────────────────────────┐
                        │   GitHub Pages (Pages env) │
                        │   custom domain: CNAME     │
                        └────────────┬───────────────┘
                                     ▼
                          https://steffenklug.cloud           (production)
                          https://steffenklug.cloud/canary/   (preview)
```

**Key principles**

- **Static-first.** All pages are pre-rendered HTML. No runtime back-end.
- **GitHub-Pages-compatible plugins only** (`jekyll-feed`, `jekyll-seo-tag`,
  `jekyll-sitemap`). No custom plugins, no `_plugins/` folder.
- **Zero-dep front-end.** Vanilla CSS (custom-properties, no Sass) and one
  small vanilla JS file (no bundler, no framework).
- **`relative_url` everywhere** so the site works at both `/` and `/canary/`.

---

## Repository layout

```
.
├── _config.yml                # Jekyll site config (collections, nav, plugins)
├── Gemfile                    # Ruby gems (Jekyll, github-pages)
├── CNAME                      # Custom domain for GitHub Pages
│
├── _layouts/                  # Page templates
│   ├── default.html           #   Outer shell: <html>, header, footer, scripts
│   ├── page.html              #   Static pages (uses default)
│   ├── post.html              #   Blog posts
│   └── item.html              #   Generic detail page for collection items
│
├── _includes/                 # Reusable template fragments
│   ├── header.html            #   Sticky header + navigation + theme toggle
│   └── footer.html            #   Footer + social links
│
├── _data/
│   └── cv.yml                 # Career timeline, skills, certifications
│
├── _posts/                    # Blog posts: YYYY-MM-DD-slug.md
├── _projects/                 # Projects collection
├── _architectures/            # Architectures & Diagrams collection
├── _books/                    # Books + Trainings (one collection, two `kind`s)
│
├── index.html                 # Home page
├── blog/index.html            # Blog listing
├── projects/index.html        # Projects grid
├── architectures/index.html   # Architectures grid
├── books/index.html           # Books + Trainings grid
├── cv/index.html              # Scrollorama CV
│
├── assets/
│   ├── css/main.css           # All styles (light/dark, components, CV)
│   ├── js/main.js             # Theme toggle, nav, scroll-reveal, CV scroll-spy
│   └── favicon.svg            # SVG favicon
│
└── .github/
    └── workflows/
        ├── jekyll-gh-pages.yml          # Manual fallback build
        └── smart-canary-deployment.yml  # Production + canary build
```

---

## Content model

All content is plain Markdown with YAML front-matter. You don't need to
touch HTML to add or edit content.

### Blog posts

Files in `_posts/` named `YYYY-MM-DD-slug.md`.

```yaml
---
title: "Azure landing zones, without the dogma"
subtitle: "Optional one-line description shown in the header."
date: 2026-04-15
tags: [azure, platform, landing-zones]
---

Markdown body goes here. Headings, lists, code, blockquotes, images all work.
```

The post URL is `/blog/YYYY/MM/DD/slug/` (defined by `permalink` in
`_config.yml`). Posts automatically appear on `/blog/` sorted by date.

### Projects

Files in `_projects/`. The order on the index page is controlled by `order`
(ascending).

```yaml
---
title: "Azure Platform for an Enterprise Estate"
subtitle: "Landing zones, policy, and a paved path for product teams."
year: 2025
role: "Lead Cloud Architect"
order: 1
tags: [azure, landing-zones, platform]
image: /assets/images/azure-platform.png   # optional
image_alt: "Architecture diagram of the platform"
links:
  - label: "Reference repo"
    url: "https://github.com/your-org/your-repo"
---

Long-form description in Markdown.
```

### Architectures & Diagrams

Files in `_architectures/`. Same idea as projects, with cloud-specific fields:

```yaml
---
title: "Hub-and-Spoke on Azure"
subtitle: "A reusable network topology for enterprise landing zones."
cloud: "Azure"
year: 2025
order: 1
tags: [networking, landing-zone, security]
image: /assets/images/hub-spoke.svg
---
```

### Books & Trainings

A single `_books/` collection holds **both** book recommendations and
trainings/certifications. Use the `kind` field to switch:

```yaml
---
title: "Team Topologies"
subtitle: "Organizing teams for fast flow."
author: "Matthew Skelton & Manuel Pais"
year: 2019
kind: book          # 'book' or 'training'
tags: [organization, platform-engineering]
image: /assets/images/team-topologies.jpg
---
```

For trainings, replace `author` with `provider`:

```yaml
---
title: "Azure Solutions Architect Expert (AZ-305)"
provider: "Microsoft"
year: 2024
kind: training
tags: [azure, certification]
---
```

The `books/index.html` page splits items into two grids using a
`where` filter on `kind`.

### CV / scrollorama

The CV page is fully driven by `_data/cv.yml`. To update your career, edit
that file — no template changes needed.

```yaml
name: Steffen Klug
title: Cloud Architect
location: Germany
summary: >-
  Cloud architect focused on Azure landing zones, Kubernetes platforms,
  and the developer experience that makes them a pleasure to use.

roles:
  - period: "2024 — Now"        # shown in the sticky left timeline
    year: 2024
    role: "Lead Cloud Architect"
    org: "Confidential Enterprise Client"
    location: "Hybrid · Germany"
    summary: >-
      One-paragraph summary of the role.
    tags: [Azure, Bicep, AKS]
    bullets:
      - "Highlight 1"
      - "Highlight 2"
  # … more roles, newest first

certifications:
  - "Microsoft Certified: Azure Solutions Architect Expert (AZ-305)"

skills:
  - group: "Cloud"
    items: ["Azure", "Landing Zones", "Networking"]
```

**How the scrollorama works.** The page is a CSS Grid:

- Left column (`.cv-aside`) is **`position: sticky`** — the timeline stays
  pinned while you scroll through the right column.
- Right column (`.cv-stage`) renders one `<article class="cv-scene">` per
  role.
- An `IntersectionObserver` in `assets/js/main.js` watches the scenes and
  toggles `is-active` on the matching timeline item.
- A second `IntersectionObserver` reveals each scene with a fade/slide as
  it enters the viewport.
- Click or `Enter`/`Space` on a timeline item to smooth-scroll to that role.

On screens narrower than `880px` the timeline collapses into a horizontal
chip row and the layout becomes single-column.

---

## Styling and theming

All styles live in `assets/css/main.css` (~490 lines, no preprocessor).

### Design tokens

Color, spacing, typography, and motion are defined as CSS custom properties
on `:root`. To re-skin the site, change these values — nothing else.

```css
:root {
  --c-bg: #f7f5f1;
  --c-bg-alt: #efece6;
  --c-surface: #ffffff;
  --c-text: #1b1b1a;
  --c-text-muted: #6b6a66;
  --c-line: #e3dfd6;
  --c-accent: #c8553d;          /* primary accent — used for hover & dots */
  --c-accent-soft: #e8b4a7;     /* hero glow */

  --radius: 14px;
  --radius-lg: 22px;
  --maxw: 1120px;               /* main content width */
  --maxw-narrow: 760px;         /* article width (blog, prose) */

  --f-sans: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Inter, ...;
  --f-serif: ui-serif, Georgia, "Times New Roman", serif;
  --f-mono: ui-monospace, SFMono-Regular, "JetBrains Mono", Menlo, monospace;

  --t-fast: 160ms cubic-bezier(.4,.0,.2,1);
  --t-med:  280ms cubic-bezier(.4,.0,.2,1);
}
```

### Light / dark / auto

The site supports three states, cycled by the header toggle:

| `data-theme` | Behavior                                        |
| ------------ | ----------------------------------------------- |
| `auto`       | Follows `prefers-color-scheme` (default)        |
| `light`      | Forced light                                    |
| `dark`       | Forced dark                                     |

Implementation:

- **No FOUC:** an inline script in `<head>` (see `_layouts/default.html`)
  reads `localStorage.theme` and sets `data-theme` + `data-resolved` on
  `<html>` *before* paint.
- The dark palette is applied by either `html[data-theme="dark"]`,
  `html[data-resolved="dark"]`, or
  `@media (prefers-color-scheme: dark) html[data-theme="auto"]`.
- The toggle cycles `auto → light → dark → auto` and persists in
  `localStorage`.

### Component classes

| Class                       | Used for                                     |
| --------------------------- | -------------------------------------------- |
| `.container`, `.narrow`     | Max-width wrappers                           |
| `.btn.primary`, `.btn.ghost`| Primary / secondary buttons                  |
| `.eyebrow`                  | Small uppercase label above headings         |
| `.lede`                     | Large secondary paragraph after a heading    |
| `.cards` / `.card`          | Homepage feature grid                        |
| `.grid` / `.grid-card`      | Projects / architectures / books grids       |
| `.post-list` / `.post-row`  | Blog index list                              |
| `.tags` / `.tags.small`     | Small chip lists                             |
| `.cv-scroll`, `.cv-scene`,
  `.cv-timeline`              | CV scrollorama (see CV section above)        |
| `.reveal`, `.reveal-children`| Opt-in scroll-reveal animation              |
| `.prose`                    | Long-form article content (blog/item bodies) |

To animate something on scroll, just add `class="reveal"` (or wrap a list in
`reveal-children` to stagger its children). The JS handles the rest.

`prefers-reduced-motion` is fully respected: all transitions, transforms,
and reveal animations are disabled when the user has set that preference.

---

## JavaScript behavior

`assets/js/main.js` is the only script. It is plain ES5/ES6 (no modules, no
build step) and is loaded with `defer`. Sections:

1. **Theme** — applies saved theme, listens for OS theme changes when in
   `auto`, cycles theme on toggle click, persists to `localStorage`.
2. **Mobile nav** — toggles `.is-open` on `.site-nav`, closes on outside
   click and `Esc`.
3. **Header scroll state** — adds `.is-scrolled` to `<header>` once the
   user scrolls past 4px (used for the bottom border).
4. **Scroll reveal** — single `IntersectionObserver` for `.reveal` and
   children of `.reveal-children`, with a small staggered delay.
5. **CV scrollorama** —
   - One observer reveals scenes as they enter view.
   - A second observer (with `rootMargin: '-30% 0px -55% 0px'`) tracks
     which scene is "centered" and toggles `is-active` on the left
     timeline item.
   - Click and keyboard handlers smooth-scroll to a scene.

If `IntersectionObserver` is unavailable, all reveals fall back to visible
immediately.

---

## Build and deployment

### GitHub Pages workflows

Two workflows live in `.github/workflows/`. Both write to the
`github-pages` deployment environment, so only one runs at a time
(`concurrency: pages`).

#### 1. `smart-canary-deployment.yml` — production + canary (default)

Triggered on push to `main` or `develop`, and on manual dispatch.

Pipeline:

1. Checks out **`main`** into `main-source/` (always).
2. Detects whether core files changed in `main` (Gemfile, layouts,
   `_includes`, `_posts`, assets, etc.) using `dorny/paths-filter`.
3. Tries to restore a cached `_site/` from a previous run.
4. Sets up Ruby 3.3 with `ruby/setup-ruby@v1` and `bundler-cache: true`.
5. Builds `main` with `bundle exec jekyll build --destination ../_site`
   **only if** the cache missed or core files changed in `main`.
6. Checks out **`develop`** into `canary-source/` (continues on error if
   the branch doesn't exist).
7. If `develop` has a `Gemfile`, installs deps, **injects a yellow
   "🐣 Canary Build" badge** into `_layouts/default.html`, and builds
   into `_site/canary/` with `--baseurl "/canary"`.
8. Uploads `_site/` (which now contains both production and canary) and
   deploys via `actions/deploy-pages@v4`.

The injected badge is added in the runner only — the repo's
`_layouts/default.html` is never modified by the workflow.

#### 2. `jekyll-gh-pages.yml` — manual fallback

A minimal "GitHub-managed" build using `actions/jekyll-build-pages@v1`. It
is `workflow_dispatch`-only by default and doesn't build the canary. Use
it as a sanity-check fallback if the smart workflow ever has trouble.

### Canary deployment

The canary build is **identical to production** except:

- `--baseurl "/canary"` is passed to Jekyll, which means every URL
  produced by `relative_url` (and therefore every link, asset, image
  reference, and CSS/JS path in this site) is prefixed with `/canary`.
- A yellow "🐣 Canary Build" badge with a "Back to Live" link to `/` is
  injected into the bottom-right of every page.

To preview a change before promoting it:

```bash
git checkout -b develop          # if you haven't yet
# ... make changes ...
git push origin develop          # triggers a canary build
# Preview at https://steffenklug.cloud/canary/
git checkout main && git merge develop && git push origin main
# Promotes to https://steffenklug.cloud/
```

> **Important:** because all internal links use `relative_url`, *never*
> hard-code absolute paths like `/assets/css/main.css` or
> `/blog/`. Always use `{{ '/path' | relative_url }}`. Otherwise links
> break inside the canary subdirectory.

### Local development

You'll need a recent Ruby (the CI uses **Ruby 3.3**) and Bundler.

```bash
# from repo root
bundle install                   # installs Jekyll, github-pages, etc.
bundle exec jekyll serve         # http://localhost:4000  (live reload)
# or just build:
bundle exec jekyll build         # outputs to ./_site
```

To preview the canary baseurl behavior locally:

```bash
bundle exec jekyll serve --baseurl "/canary"
# now open http://localhost:4000/canary/
```

#### Pinned versions

The `Gemfile` pins **`github-pages ~> 232`**, which transitively gives:

| Gem            | Version  | Why it matters                                      |
| -------------- | -------- | --------------------------------------------------- |
| `jekyll`       | 3.10.0   | Matches what GitHub Pages currently runs            |
| `liquid`       | 4.0.4    | **Required.** `4.0.3` calls `String#tainted?` which Ruby 3.2+ removed — builds break on Ruby 3.3 runners |
| `kramdown`     | 2.4.0    | Markdown engine                                     |
| `rouge`        | 3.30.0   | Syntax highlighter                                  |

> **Don't downgrade `github-pages` below 232.** v223 hard-pinned
> `liquid = 4.0.3` and breaks on the Ruby 3.3.x that GitHub Actions ships.

The `Gemfile` also adds back `csv`, `bigdecimal`, `logger`, and `base64`,
which Ruby 3.4+ moved out of the default stdlib but Jekyll still requires.
These are harmless on Ruby 3.3.

#### Ruby 4 note

If you're on a system where the default Ruby is 4.0+ (some macOS Homebrew
setups symlink `ruby@3.3` to Ruby 4), gem resolution will fail because
`commonmarker` doesn't support Ruby 4 yet. **CI is unaffected** because
the workflow pins Ruby 3.3.11. To preview locally, use a real Ruby 3.3 via
`mise`/`rbenv`/`asdf`, or use Docker:

```bash
# Resolve gems and run a build in a Ruby 3.3 container
docker run --rm -v "$PWD:/work" -w /work ruby:3.3.11-slim bash -c "
  apt-get update -qq && apt-get install -y -qq build-essential git >/dev/null
  gem install bundler --no-document
  bundle install
  bundle exec jekyll serve --host 0.0.0.0
"

# Then open http://localhost:4000
```

### Useful commands

```bash
bundle exec jekyll serve --livereload     # local dev with auto-reload
bundle exec jekyll serve --drafts         # include _drafts/
bundle exec jekyll build --trace          # full backtrace on errors
bundle exec jekyll doctor                 # config sanity check
```

---

## Configuration reference

`_config.yml` is the single source of truth for site-wide settings.

| Key                  | What it controls                                         |
| -------------------- | -------------------------------------------------------- |
| `title`              | Site title (used in `<title>`, header brand)             |
| `tagline`            | Subtitle shown alongside the title                       |
| `description`        | Default `<meta name="description">` and SEO              |
| `author`             | Used in the footer copyright                             |
| `url` / `baseurl`    | Canonical site URL (no trailing slash)                   |
| `permalink`          | Blog post URL pattern                                    |
| `plugins`            | Only GitHub-Pages-allowed plugins                        |
| `collections`        | Defines `projects`, `architectures`, `books`             |
| `defaults`           | Default `layout` per content type                        |
| `nav`                | Top navigation items (used by `_includes/header.html`)   |
| `social`             | GitHub / LinkedIn / email used in the footer             |

To add another nav item:

```yaml
nav:
  - title: Talks
    url: /talks/
```

Then create `talks/index.html` (or a collection if you want detail pages).

### Adding a new collection

1. Add the collection to `_config.yml`:
   ```yaml
   collections:
     talks:
       output: true
       permalink: /talks/:path/
   ```
2. Add a default `layout: item` and `section: talks` so item pages render
   with the standard detail template.
3. Create `_talks/` and put one Markdown file per talk inside.
4. Create `talks/index.html` modeled on `projects/index.html`.

---

## Custom domain (CNAME)

The `CNAME` file at the root of the repo configures GitHub Pages to serve
the site at `steffenklug.cloud`. To change the domain:

1. Update the `CNAME` file with the new bare hostname.
2. Update `url:` in `_config.yml`.
3. Configure DNS (`A`/`AAAA` to GitHub Pages IPs, or a `CNAME` to
   `<username>.github.io`).
4. In GitHub repository **Settings → Pages**, verify the domain and
   enable **Enforce HTTPS** once the cert is provisioned.

> The `CNAME` file in this repo currently contains
> `steffenklug.cloud`.

---

## Accessibility & performance notes

- Every page has a **skip link** (`.skip-link`) that targets `#main`.
- The mobile nav toggle exposes `aria-expanded`. CV timeline items expose
  `role="button"` and respond to `Enter` / `Space`.
- Color contrast is checked against WCAG AA in both themes.
- `prefers-reduced-motion` disables all transitions, transforms, and
  scroll animations.
- The site loads **one** CSS file and **one** JS file. No web fonts are
  loaded — typography uses the system font stack.
- Images should use `loading="lazy"` (the layouts already do this for
  hero and grid thumbnails).
- The favicon is a single inline-styled SVG.

---

## Roadmap / nice-to-haves

These are intentional non-goals right now but reasonable next steps:

- Pagination on `/blog/` once there are enough posts.
- Tag pages (`/tags/azure/` etc.) — needs `jekyll-archives`, which is
  **not** GitHub-Pages-whitelisted, so it would require a self-hosted
  build step.
- Mermaid rendering for diagrams in posts (client-side only).
- A simple search box (Lunr-based).
- An `og:image` per post.

---

## License & credits

- Content (text in `_posts/`, `_projects/`, `_architectures/`, `_books/`,
  `_data/cv.yml`) is © Steffen Klug, all rights reserved.
- Layout, CSS, and JS scaffolding may be reused freely under
  [MIT](https://opensource.org/licenses/MIT) — adapt for your own site.

Built with [Jekyll](https://jekyllrb.com/) on
[GitHub Pages](https://pages.github.com/).

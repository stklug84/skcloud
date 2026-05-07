# Contributing to skcloud

Thanks for taking the time to contribute. This document describes how to
propose changes — whether you're fixing a typo, adding a blog post, or
shipping a new section.

This is a small personal site, but the workflow is set up so that anyone
can submit a clean PR and have it previewed automatically on the canary
URL before it goes live.

---

## Table of contents

- [Ground rules](#ground-rules)
- [Branching model](#branching-model)
- [Local setup](#local-setup)
- [Running and previewing the site](#running-and-previewing-the-site)
- [Common contribution recipes](#common-contribution-recipes)
  - [Add a blog post](#add-a-blog-post)
  - [Add a project / architecture / book](#add-a-project--architecture--book)
  - [Update the CV](#update-the-cv)
  - [Add an image](#add-an-image)
  - [Tweak styles](#tweak-styles)
  - [Add a new top-level section](#add-a-new-top-level-section)
- [Style guide](#style-guide)
- [Testing your change](#testing-your-change)
- [Pull request checklist](#pull-request-checklist)
- [Reporting bugs](#reporting-bugs)

---

## Ground rules

- **Be kind and direct.** Reviews are about the change, not the person.
- **Keep PRs small and focused.** One topic per PR — a typo fix is its own
  PR, not bundled with a new section.
- **No unrelated dependencies.** This site is intentionally
  zero-Node-build, vanilla CSS/JS, and uses only GitHub-Pages-allowed
  Jekyll plugins. Don't add a build step, framework, or new plugin
  without first opening an issue to discuss it.
- **No secrets.** Don't commit API keys, tokens, or anything that
  shouldn't be public — this is an open repo.
- **Respect copyright.** Only commit content (text, images) that you
  authored or that has a clearly compatible license.

---

## Branching model

| Branch     | Purpose                                                 |
| ---------- | ------------------------------------------------------- |
| `main`     | Production. Always deployable. Protected.               |
| `develop`  | Canary preview. Auto-deployed to `/canary/`.            |
| `feat/*`   | Short-lived feature branches off `develop`.             |
| `fix/*`    | Short-lived bug-fix branches off `develop` or `main`.   |
| `content/*`| Content-only changes (posts, CV updates, etc.).         |

**Typical flow**

```text
   feat/dark-mode-tweaks  ── PR ──▶  develop  ── PR ──▶  main
                                      │
                                      └── auto-deploys to /canary/
```

For **content-only changes** you can branch directly off `main` and PR
straight into `main`. For **anything that touches layouts, CSS, JS, or
the workflow files**, use `develop` so the change gets a canary preview
first.

---

## Local setup

You'll need:

- **Ruby 3.3** (the version pinned by CI).
  Newer Rubies *may* work — see the Ruby 3.4 / Ruby 4 notes in the
  [README](./README.md#local-development) — but 3.3 is the supported version.
- **Bundler** (`gem install bundler`).
- **Git**.

```bash
git clone git@github.com:stklug84/skcloud.git
cd skcloud
bundle install
```

If you don't have a system Ruby 3.3 you can use Docker instead:

```bash
docker run --rm -it -p 4000:4000 -v "$PWD:/srv/jekyll" \
  jekyll/jekyll:3.9 jekyll serve --host 0.0.0.0
```

---

## Running and previewing the site

```bash
bundle exec jekyll serve --livereload
# → http://localhost:4000
```

Useful flags:

```bash
bundle exec jekyll serve --drafts            # include _drafts/
bundle exec jekyll serve --baseurl "/canary" # simulate the canary build
bundle exec jekyll build  --trace            # full backtrace on errors
bundle exec jekyll doctor                    # config sanity check
```

When you push a branch to GitHub, the canary workflow only runs on
`develop`. To get a canary URL for a feature branch, merge it into
`develop` first.

---

## Common contribution recipes

### Add a blog post

1. Create `_posts/YYYY-MM-DD-your-slug.md`. The date in the filename is
   required.
2. Add front-matter:
   ```yaml
   ---
   title: "Your post title, in sentence case"
   subtitle: "Optional one-liner shown under the title."
   date: 2026-05-07
   tags: [azure, platform]
   ---
   ```
3. Write the body in Markdown. Keep paragraphs short. Use `##` and `###`
   for sub-sections (don't reuse `#` — that's the post title).
4. Preview locally (`jekyll serve`) and check that the post appears in
   `/blog/` and renders correctly at its own URL.
5. Commit with a message like `content(blog): add post on AKS upgrades`.

**Drafts** can live in `_drafts/` (no date in filename). They only render
when you pass `--drafts` to `jekyll serve`.

### Add a project / architecture / book

Pick the right collection:

| Section         | Folder            | Required fields                                  |
| --------------- | ----------------- | ------------------------------------------------ |
| Projects        | `_projects/`      | `title`, `year`, `order` *(for sort)*            |
| Architectures   | `_architectures/` | `title`, `cloud`, `year`, `order`                |
| Books           | `_books/`         | `title`, `kind: book`, `author`, `year`          |
| Trainings       | `_books/`         | `title`, `kind: training`, `provider`, `year`    |

Common optional fields: `subtitle`, `tags` (list), `image`, `image_alt`,
`links` (list of `{label, url}`).

Example for a new project:

```yaml
---
title: "AKS Paved Path"
subtitle: "An opinionated, secure-by-default Kubernetes platform on Azure."
year: 2024
role: "Platform Architect"
order: 2
tags: [aks, kubernetes, devex]
image: /assets/images/aks-paved-path.png
links:
  - label: "Reference repo"
    url: "https://github.com/example/aks-paved-path"
---

Markdown body describing the project.
```

The item gets its own detail page automatically (using `_layouts/item.html`)
and appears on the section's index page sorted by `order`.

### Update the CV

The CV is **entirely** driven by `_data/cv.yml`. To add a new role:

```yaml
roles:
  - period: "2026 — Now"
    year: 2026
    role: "New Role Title"
    org: "Where you work"
    location: "City · Country"
    summary: >-
      One paragraph explaining what you do.
    tags: [Tag1, Tag2]
    bullets:
      - "Outcome 1"
      - "Outcome 2"
```

Roles render top-to-bottom in the order they appear in the YAML — keep
**newest first**.

To add a certification:

```yaml
certifications:
  - "Microsoft Certified: Azure Network Engineer Associate (AZ-700)"
```

To add a skill group:

```yaml
skills:
  - group: "AI / ML"
    items: ["Azure OpenAI", "Foundry", "RAG"]
```

No template changes needed — just edit the YAML and push.

### Add an image

1. Put the file in `assets/images/`.
2. Reference it in front-matter or Markdown using a `relative_url` path:
   ```yaml
   image: /assets/images/my-diagram.svg
   image_alt: "Hub-and-spoke topology with private endpoints."
   ```
   ```markdown
   ![Diagram of a landing zone]({{ '/assets/images/landing-zone.png' | relative_url }})
   ```
3. **Always provide an `alt` text.** It's required for accessibility.
4. Optimize images before committing:
   - SVG: run through `svgo`.
   - PNG/JPG: keep under ~250 KB. Use a tool like `squoosh` or
     `imageoptim` to compress.
   - Prefer SVG for diagrams, JPG for photos, PNG for screenshots.

### Tweak styles

All styles live in `assets/css/main.css`. The file is organized by
section comment headers (`/* ---------- Header / nav ---------- */`,
etc.). Find the right block, make your change, save.

- Prefer changing **CSS custom properties** on `:root` rather than
  hard-coding values inside components — that way the change applies to
  both light and dark themes.
- Don't introduce a CSS framework or preprocessor. Plain CSS only.
- If you add a new animation, **respect** `prefers-reduced-motion` (see
  the existing block at the bottom of `main.css`).

### Add a new top-level section

This is rare. If you really need it (say, a `/talks/` section):

1. Add a collection in `_config.yml`:
   ```yaml
   collections:
     talks:
       output: true
       permalink: /talks/:path/
   defaults:
     - scope: { type: talks }
       values:
         layout: item
         section: talks
   ```
2. Add a nav entry:
   ```yaml
   nav:
     - title: Talks
       url: /talks/
   ```
3. Create `_talks/` and one Markdown file per item.
4. Create `talks/index.html`, modeling on `projects/index.html`.
5. If the section needs a special "back" label, extend the `case`
   statement in `_layouts/item.html`.

Open an issue first if you're not sure the new section fits the site's
scope.

---

## Style guide

### Markdown

- **Sentence case** for titles: `Azure landing zones, without the dogma`,
  not `Azure Landing Zones Without The Dogma`.
- One sentence per line for long paragraphs is fine (it makes diffs much
  cleaner) — Markdown still renders them as one paragraph.
- Use fenced code blocks with a language hint:
  ````markdown
  ```bash
  bundle exec jekyll serve
  ```
  ````
- Use blockquotes (`>`) for callouts.
- Link with `[text](url)` for external links; use
  `{{ '/path' | relative_url }}` for internal links so the canary build
  still works.

### YAML front-matter

- Always quote strings that contain `:`, `[`, `]`, or start with a number.
- Keep keys lowercase (`title`, not `Title`).
- Use `[a, b, c]` flow style for short tag lists, block style for long
  ones.

### HTML / Liquid

- All asset and link URLs must go through `relative_url`:
  ```liquid
  <a href="{{ '/blog/' | relative_url }}">Blog</a>
  <link rel="stylesheet" href="{{ '/assets/css/main.css' | relative_url }}">
  ```
  Hard-coded `/...` paths break the canary build.
- Indent with 2 spaces.
- Prefer semantic tags (`<article>`, `<nav>`, `<section>`, `<header>`,
  `<footer>`) over generic `<div>`.

### CSS

- 2-space indent, lowercase hex colors, single quotes around strings,
  trailing semicolons.
- Group related properties; one selector per line in compound selectors.
- New tokens go on `:root`, with a dark-mode override in the
  `html[data-resolved="dark"]` block (and the
  `prefers-color-scheme` `auto` block).
- Don't use `!important` unless absolutely necessary.

### JavaScript

- Vanilla JS. No imports, no modules.
- Wrap everything in an IIFE (the existing `main.js` already does).
- Use `'use strict'`.
- Feature-detect new APIs (e.g. `if ('IntersectionObserver' in window)`)
  and fall back gracefully.

### Commit messages

Use a short, imperative subject line, optionally with a scope:

```
content(blog): add post on AKS Automatic
style(cv): tighten timeline spacing on mobile
fix(nav): close mobile menu on Esc
docs: clarify canary deployment in README
chore(deps): bump github-pages to latest
```

Common scopes: `blog`, `cv`, `projects`, `architectures`, `books`,
`nav`, `theme`, `cv`, `ci`, `deps`.

---

## Testing your change

Before opening a PR:

1. **Run locally.** `bundle exec jekyll serve` and click around the
   pages you changed (and at least one page you didn't, to make sure
   nothing else broke).
2. **Test light + dark.** Click the theme toggle in the header and
   verify your change looks good in both. Resize the browser narrow
   (≤ 760 px) to check the mobile layout.
3. **Test the canary baseurl.** If you changed any links, run:
   ```bash
   bundle exec jekyll serve --baseurl "/canary"
   # then visit http://localhost:4000/canary/
   ```
   All internal links should still work.
4. **Run jekyll doctor:**
   ```bash
   bundle exec jekyll doctor
   ```
5. **Sanity-check the build:**
   ```bash
   bundle exec jekyll build --trace
   # check ./_site/ for the expected files
   ```

CI runs the same build with Ruby 3.3 — if your local build passes on
3.3, CI will almost always pass too.

---

## Pull request checklist

When opening a PR, please tick these boxes (or call out why one
doesn't apply):

- [ ] PR targets `develop` (for code/style/layout) **or** `main` (for
      content-only).
- [ ] One topic per PR.
- [ ] `bundle exec jekyll build` succeeds locally.
- [ ] Tested in **both** light and dark theme.
- [ ] Tested at narrow widths (mobile layout).
- [ ] All internal links use `relative_url`.
- [ ] Images are optimized and have descriptive `alt` text.
- [ ] No unrelated dependencies / files added.
- [ ] No secrets or private info committed.
- [ ] Commit messages follow the [style guide](#commit-messages).

After your PR is merged into `develop`, you can preview the change at
`https://steffenklug.cloud/canary/`. A second PR from `develop` → `main`
promotes it to production.

---

## Reporting bugs

Open an issue with:

- **What you expected** to happen.
- **What actually happened** (with a screenshot if it's visual).
- **How to reproduce it** — URL, browser, viewport size, theme.
- **Browser + OS** version.

If you found a typo or factual error in a post, a one-line PR fixing it
is even more welcome than an issue.

---

Thanks again for contributing.

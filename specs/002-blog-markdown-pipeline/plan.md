# Implementation Plan: Blog Views Analytics

**Branch**: `003-blog-views-analytics` | **Date**: 2026-06-21 | **Spec**: N/A (user-requested feature)
**Input**: User request for a per-article view counter displayed on blog cards and article pages.

## Summary

Add a simple per-article "views" counter badge to the portfolio blog. Each blog post will display an eye icon (👁) with a live visit count, both on the blog listing cards (`blog.html`) and on individual article pages (generated `.html` files). The counter uses a free, zero-config third-party badge service identical in approach to the `komarev.com/ghpvc` counter already used in the project's `README.md`.

## Technical Context

**Language/Version**: HTML, CSS, JavaScript (vanilla, ES5-compatible)
**Primary Dependencies**: None new — uses an external badge image service (no JS library)
**Storage**: N/A — view counts are stored server-side by the badge service
**Testing**: Manual browser verification (dark + light mode, responsive)
**Target Platform**: Static site on GitHub Pages (custom domain: `satyamthakur.com.np`)
**Project Type**: Static portfolio website
**Performance Goals**: No measurable impact — one additional `<img>` per card/article
**Constraints**: No backend; must work with purely static files served from GitHub Pages

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Quality | ✅ PASS | Small, focused changes to existing rendering pipeline. No duplicated logic. |
| II. Testing Standards | ✅ PASS | Manual verification checklist provided. Pure HTML/CSS — no new JS logic to unit-test. |
| III. UX Consistency | ✅ PASS | Reuses existing `blog-meta` icon+text pattern, existing CSS variables, existing font-awesome icons. |
| IV. Performance | ✅ PASS | One small `<img>` per card/article. Image is <1 KB SVG badge. Loaded lazily. |

## Open Questions

> [!IMPORTANT]
> **Choice of view-counter service** — The plan proposes using the **komarev.com/ghpvc** service you already use for your GitHub profile. This is the simplest approach: one `<img>` tag per page, zero JavaScript, zero API keys.
>
> However, this service was designed for GitHub profile views, not arbitrary web pages. Each "page" is identified by a `username` parameter. We can repurpose this by creating a unique "username" per article slug (e.g., `satyam-blog-rdma-infiniband`).
>
> **Alternatives considered:**
> 1. **Visitor Badge** (`visitor-badge.laobi.icu`) — Similar image-based counter; supports arbitrary page identifiers
> 2. **Hits by Siliconwat** (`hits.sh`) — Lightweight SVG counter designed for any page (not just GitHub)
> 3. **GoatCounter** — Full analytics dashboard, privacy-friendly, but requires account setup and JS snippet
>
> **Recommendation:** Use `komarev.com/ghpvc` since you're already familiar with it, or switch to `hits.sh` which is purpose-built for per-page tracking.
>
> **Please confirm which service you'd prefer, or if `komarev` is fine.**

> [!IMPORTANT]
> **Badge visibility** — Should the view count badge be:
> - **(A)** A visible SVG badge image (like your README counter) — shows "Views | 123" as a colored shield
> - **(B)** A custom-styled text element where we fetch the count and display it next to an eye icon in the same font/style as the existing meta line (date • category • 👁 123 views)
>
> Option (A) is the simplest (pure `<img>`, zero JS). Option (B) looks more native but requires either a JS fetch or using the badge as a hidden pixel + a separate count API call.
>
> **Recommendation:** Option (A) for simplicity — embed the badge image directly in the blog-meta area. It will match the blueviolet style you already use.

## Proposed Changes

### Blog Card Rendering (article-renderer.js)

#### [MODIFY] [article-renderer.js](file:///c:/Users/SATYAM/Documents/ACareer/I_Portfolio/satyam-thakur/js/article-renderer.js)

Add a views badge `<img>` to the `renderCards()` function output, placed in the `.blog-meta` div alongside date and category. The badge URL is constructed from the article slug:

```diff
 "<div class=\"blog-meta\">" +
   "<i class=\"far fa-calendar\"></i>" +
   "<span>" + date + "</span>" +
   "<span class=\"separator\">•</span>" +
   "<i class=\"fas fa-tags\"></i>" +
   "<span>" + categoryText + "</span>" +
+  "<span class=\"separator\">•</span>" +
+  "<img class=\"blog-views-badge\" src=\"https://komarev.com/ghpvc/?username=satyam-blog-" + slug + "&label=Views&color=blueviolet&style=flat-square\" alt=\"Views\" loading=\"lazy\">" +
 "</div>" +
```

The slug will be derived from the item's `slug` or `id` field (already present in `articles-index.json`).

---

### Generated Article Pages (generate-articles-index.js)

#### [MODIFY] [generate-articles-index.js](file:///c:/Users/SATYAM/Documents/ACareer/I_Portfolio/satyam-thakur/tools/generate-articles-index.js)

In the `buildArticlePage()` function, add the views badge image next to the "Published: date" line in the article header:

```diff
   <h1 class="mb-2">${title}</h1>
-  <p class="mb-4">Published: ${publishedDate}</p>
+  <p class="mb-4">Published: ${publishedDate}
+    <span class="separator" style="margin: 0 0.5rem;">•</span>
+    <img class="blog-views-badge" src="https://komarev.com/ghpvc/?username=satyam-blog-${slug}&label=Views&color=blueviolet&style=flat-square" alt="Views" loading="lazy">
+  </p>
   <p><a href="../../blog.html">← Back to Blog</a></p>
```

This requires passing the `slug` (already available in the `record` object) into the page template.

---

### Styling

#### [MODIFY] [custom.css](file:///c:/Users/SATYAM/Documents/ACareer/I_Portfolio/satyam-thakur/css/custom.css)

Add styles for the views badge to blend naturally with the existing `.blog-meta` layout:

```css
/* Blog views badge */
.blog-views-badge {
  height: 20px;
  vertical-align: middle;
  border-radius: 3px;
  opacity: 0.9;
  transition: opacity 0.2s ease;
}

.blog-views-badge:hover {
  opacity: 1;
}
```

---

### Rebuild HTML Pages

After modifying `generate-articles-index.js`, re-run the build to regenerate all article HTML files with the new views badge:

```bash
node tools/generate-articles-index.js
```

## Project Structure

### Documentation (this feature)

```text
specs/002-blog-markdown-pipeline/
├── plan.md              # This file
├── research.md          # Phase 0 output (minimal — straightforward integration)
├── data-model.md        # Phase 1 output
└── quickstart.md        # Phase 1 output
```

### Source Code (repository root)

```text
js/
└── article-renderer.js     # MODIFIED — add badge to blog cards
tools/
└── generate-articles-index.js  # MODIFIED — add badge to article HTML pages
css/
└── custom.css              # MODIFIED — badge styling
content/articles/
├── *.html                  # REGENERATED — all article pages get the badge
└── articles-index.json     # No changes needed (slug already present)
```

**Structure Decision**: Single-project static site; all changes are in existing files. No new files needed.

## Verification Plan

### Manual Verification

1. Open `blog.html` — each blog card shows a blueviolet "Views | N" badge in the meta line
2. Click into an article page — the article header shows the same badge next to the publish date
3. Refresh the page — the view count increments by 1
4. Test in both dark mode and light mode — badge is legible
5. Test on mobile viewport — badge doesn't break the layout
6. Verify the badge URL pattern: `https://komarev.com/ghpvc/?username=satyam-blog-{slug}&label=Views&color=blueviolet&style=flat-square`
7. Confirm no console errors on page load

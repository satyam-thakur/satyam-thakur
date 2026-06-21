# Quickstart: Blog Views Analytics

## What This Feature Does

Adds a per-article view count badge (blueviolet shield-style) to:
1. Each blog card on the `/blog.html` listing page
2. Each individual article page (e.g., `content/articles/*.html`)

The badge shows "Views | N" and increments each time the page is loaded.

## How to Verify

1. Open `blog.html` in a browser
2. Each blog card should show a blueviolet "Views" badge in the meta line
3. Click any article — the article header should also show the badge
4. Refresh — the count should increment

## How to Rebuild After Changes

```bash
node tools/generate-articles-index.js
```

This regenerates all article HTML files and the articles-index.json.

## Files Involved

| File | Role |
|------|------|
| `js/article-renderer.js` | Renders blog cards on `blog.html` — adds badge to card HTML |
| `tools/generate-articles-index.js` | Generates article HTML pages — adds badge to page header |
| `css/custom.css` | Styles the badge for alignment and hover effects |

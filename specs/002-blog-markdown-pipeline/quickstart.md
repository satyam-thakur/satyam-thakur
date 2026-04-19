# Quickstart: Blog Markdown Reader + Auto Listing

## Local generation

Run this from the repository root to build the article index:

```powershell
node tools/generate-articles-index.js
```

This writes output to:

- content/articles/articles-index.json
- content/articles/<slug>.html

## Author workflow

1. Add a new markdown file under content/articles.
2. Include YAML front matter at the top of the file.
3. Keep draft set to false for published posts.
4. Run the generator locally to regenerate index and static article pages.
5. Push changes and let GitHub Actions refresh the index automatically.

## Recommended front matter

```yaml
---
title: "Article title"
date: 2026-04-19
lastmod: 2026-04-19
author: "Satyam Thakur"
description: "Short summary for blog card."
slug: "article-slug"
tags:
  - TagA
  - TagB
categories:
  - CategoryA
draft: false
canonical_url: ""
---
```

## Manual verification checklist

1. Open blog.html and confirm article cards are visible.
2. Click Read more and confirm generated local article HTML page opens.
3. Verify dark and light themes on both pages.
4. Verify blog cards link to content/articles/<slug>.html pages.
5. Verify article with draft: true is excluded from listing.

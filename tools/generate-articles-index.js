const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const articlesDir = path.join(repoRoot, "content", "articles");
const outputPath = path.join(articlesDir, "articles-index.json");

const DEFAULT_TOC_ENABLED = true;
const DEFAULT_TOC_STICKY = true;
const DEFAULT_TOC_LABEL = "On this page";

function escapeHtml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function parseScalar(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "";

  if ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
    return trimmed.slice(1, -1);
  }

  if (trimmed === "true") return true;
  if (trimmed === "false") return false;

  if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }

  return trimmed;
}

function parseFrontMatter(markdown) {
  const text = String(markdown || "");
  const lines = text.split(/\r?\n/);

  if (!lines.length || lines[0].trim() !== "---") {
    return { meta: {}, body: text };
  }

  let end = -1;
  for (let i = 1; i < lines.length; i += 1) {
    if (lines[i].trim() === "---") {
      end = i;
      break;
    }
  }

  if (end === -1) {
    return { meta: {}, body: text };
  }

  const yamlLines = lines.slice(1, end);
  const body = lines.slice(end + 1).join("\n");
  const meta = {};
  let currentListKey = null;

  yamlLines.forEach((line) => {
    if (!line || !line.trim() || line.trim().startsWith("#")) {
      return;
    }

    const listMatch = line.match(/^\s*-\s+(.*)$/);
    if (listMatch && currentListKey) {
      meta[currentListKey].push(parseScalar(listMatch[1]));
      return;
    }

    const keyValueMatch = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
    if (!keyValueMatch) {
      currentListKey = null;
      return;
    }

    const key = keyValueMatch[1];
    const rawValue = keyValueMatch[2];

    if (!rawValue) {
      meta[key] = [];
      currentListKey = key;
      return;
    }

    meta[key] = parseScalar(rawValue);
    currentListKey = null;
  });

  return { meta, body };
}

function extractTitle(body, fallback) {
  const headingMatch = body.match(/^#\s+(.+)$/m);
  if (headingMatch) {
    return headingMatch[1].trim();
  }
  return fallback;
}

function extractDescription(body, fallback) {
  if (fallback) return fallback;
  const lines = body
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && !line.startsWith("![") && !line.startsWith("```"));

  if (!lines.length) return "";
  return lines[0].slice(0, 180);
}

function normalizeArray(value) {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (!value) return [];
  return [String(value)];
}

function parseBoolean(value, fallback) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (typeof value === "boolean") {
    return value;
  }

  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "on"].includes(normalized)) return true;
  if (["false", "0", "no", "off"].includes(normalized)) return false;
  return fallback;
}

function sanitizeHeadingText(text) {
  return String(text || "")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function createAnchorId(text, seen) {
  const base = String(text || "")
    .toLowerCase()
    .replace(/&[a-z]+;/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-") || "section";

  const count = (seen[base] || 0) + 1;
  seen[base] = count;
  return count > 1 ? `${base}-${count}` : base;
}

function toIsoDate(input, fallbackDate) {
  const date = input ? new Date(input) : null;
  if (date && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return fallbackDate;
}

function renderInlineMarkdown(text) {
  let value = escapeHtml(text);
  value = value.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" loading="lazy">');
  value = value.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  value = value.replace(/`([^`]+)`/g, "<code>$1</code>");
  value = value.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  value = value.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  return value;
}

function markdownToHtml(markdown) {
  const lines = String(markdown || "").split(/\r?\n/);
  const output = [];
  const headings = [];
  const headingIds = {};
  let inCode = false;
  let inList = false;

  lines.forEach((line) => {
    if (line.trim().startsWith("```")) {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }

      if (!inCode) {
        inCode = true;
        output.push("<pre><code>");
      } else {
        inCode = false;
        output.push("</code></pre>");
      }
      return;
    }

    if (inCode) {
      output.push(escapeHtml(line));
      return;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    if (heading) {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
      const level = heading[1].length;
      const headingRaw = heading[2].trim();
      const headingText = sanitizeHeadingText(headingRaw);
      const headingId = createAnchorId(headingText, headingIds);

      if (level === 2 || level === 3) {
        headings.push({
          level,
          text: headingText,
          id: headingId
        });
      }

      output.push(`<h${level} id="${headingId}">${renderInlineMarkdown(headingRaw)}</h${level}>`);
      return;
    }

    const listItem = line.match(/^\s*-\s+(.+)$/);
    if (listItem) {
      if (!inList) {
        output.push("<ul>");
        inList = true;
      }
      output.push(`<li>${renderInlineMarkdown(listItem[1])}</li>`);
      return;
    }

    if (!line.trim()) {
      if (inList) {
        output.push("</ul>");
        inList = false;
      }
      return;
    }

    if (inList) {
      output.push("</ul>");
      inList = false;
    }

    output.push(`<p>${renderInlineMarkdown(line)}</p>`);
  });

  if (inList) {
    output.push("</ul>");
  }
  if (inCode) {
    output.push("</code></pre>");
  }

  return {
    html: output.join("\n"),
    headings
  };
}

function renderTocHtml(toc) {
  if (!toc.enabled || !toc.headings.length) {
    return "";
  }

  const label = escapeHtml(toc.label || DEFAULT_TOC_LABEL);
  const stickyClass = toc.sticky ? " is-sticky" : "";

  const items = toc.headings
    .map((item) => {
      const levelClass = item.level === 3 ? " toc-level-3" : " toc-level-2";
      return `<li class="article-toc-item${levelClass}"><a href="#${escapeHtml(item.id)}">${escapeHtml(item.text)}</a></li>`;
    })
    .join("\n");

  return `<aside class="article-toc${stickyClass}" aria-label="Table of contents"><p class="article-toc-title">${label}</p><ul class="article-toc-list">${items}</ul></aside>`;
}

function buildArticlePage(record, bodyHtml, toc) {
  const publishedDate = escapeHtml(record.date || "");
  const title = escapeHtml(record.title || "Untitled Article");
  const tocHtml = renderTocHtml(toc);
  const layoutClass = tocHtml ? " generated-article-layout with-toc" : " generated-article-layout";

  return `<!DOCTYPE html>
<html lang="en" itemscope itemtype="http://schema.org/Article">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="theme-color" content="#0b0f17">
  <meta name="color-scheme" content="dark">
  <title>${title} | Satyam Thakur</title>
  <link rel="canonical" href="${escapeHtml(path.basename(record.html_path || ""))}">
  <link rel="alternate" hreflang="en" href="${escapeHtml(path.basename(record.html_path || ""))}">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter:400,400i,700,700i&display=swap">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
  <link rel="stylesheet" href="../../css/wowchemy.32e2e32cf1a4c1ea152e519f8b1fda79.css">
  <link rel="stylesheet" href="../../css/custom.css?v=7">
  <style>
    .generated-article p, .generated-article li { line-height: 1.75; }
    .generated-article img { max-width: 100%; height: auto; border-radius: 8px; margin: 0.8rem 0; }
    .generated-article pre { background: #0f172a; color: #e2e8f0; border-radius: 8px; padding: 1rem; overflow-x: auto; }
    .generated-article code { background: rgba(148, 163, 184, 0.15); border-radius: 6px; padding: 0.1rem 0.35rem; }
    body.light .generated-article pre { background: #e2e8f0; color: #0f172a; }
  </style>
</head>
<body>
  <div class="wrapper">
    <nav class="navbar navbar-expand-lg navbar-light compensate-for-scrollbar fixed-top" id="navbar-main">
      <div class="container-xl">
        <div class="d-none d-lg-inline-flex"><a class="navbar-brand" href="../../index.html">Satyam Thakur</a></div>
        <div class="navbar-brand-mobile-wrapper d-inline-flex d-lg-none"><a class="navbar-brand" href="../../index.html">Stay with me!</a></div>
        <ul class="nav-icons navbar-nav flex-row ml-auto d-flex pl-md-2">
          <li class="nav-item theme-toggle">
            <a href="#" class="nav-link js-set-theme-auto" aria-label="Toggle theme">
              <i class="fas fa-moon" aria-hidden="true"></i>
            </a>
          </li>
        </ul>
      </div>
    </nav>
    <main class="main-content">
      <div class="container">
        <div class="row"><div class="col-12"><div class="py-4">
          <h1 class="mb-2">${title}</h1>
          <p class="mb-4">Published: ${publishedDate}</p>
          <p><a href="../../blog.html">← Back to Blog</a></p>
        </div></div></div>
        <div class="row"><div class="col-12"><div class="${layoutClass}">${tocHtml}<article class="blog-card generated-article">${bodyHtml}</article></div></div></div>
      </div>
    </main>
    <div class="page-footer"><div class="container"><footer class="site-footer">
      <p class="powered-by copyright-license-text">© 2025 Satyam Thakur</p>
      <p class="powered-by">Network Development Engineer</p>
      <p class="powered-by"><a href="../../blog.html">Blog</a> · <a href="../../index.html">Home</a></p>
    </footer></div></div>
  </div>
  <script>
    (function() {
      var savedTheme = localStorage.getItem('wcTheme');
      var isDarkMode = savedTheme === '1' || savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
      document.body.classList.toggle('dark', isDarkMode);
      document.body.classList.toggle('light', !isDarkMode);
      if (!savedTheme) localStorage.setItem('wcTheme', isDarkMode ? '1' : '0');

      var themeButton = document.querySelector('.js-set-theme-auto');
      if (themeButton) {
        themeButton.addEventListener('click', function(e) {
          e.preventDefault();
          var darkNow = document.body.classList.toggle('dark');
          document.body.classList.toggle('light', !darkNow);
          localStorage.setItem('wcTheme', darkNow ? '1' : '0');
        });
      }
    })();
  </script>
</body>
</html>
`;
}

function buildArticleBundle(fileName) {
  const absolutePath = path.join(articlesDir, fileName);
  const markdown = fs.readFileSync(absolutePath, "utf8");
  const parsed = parseFrontMatter(markdown);
  const stats = fs.statSync(absolutePath);
  const fallbackDate = stats.mtime.toISOString().slice(0, 10);

  const slug = parsed.meta.slug || fileName.replace(/\.md$/, "");
  const title = parsed.meta.title || extractTitle(parsed.body, slug);
  const description = extractDescription(parsed.body, parsed.meta.description);
  const date = toIsoDate(parsed.meta.date, fallbackDate);
  const lastmod = toIsoDate(parsed.meta.lastmod, date);
  const draft = parsed.meta.draft === true || String(parsed.meta.draft).toLowerCase() === "true";
  const tocEnabled = parseBoolean(parsed.meta.toc, DEFAULT_TOC_ENABLED);
  const tocSticky = parseBoolean(parsed.meta.toc_sticky, DEFAULT_TOC_STICKY);
  const tocLabel = parsed.meta.toc_label ? String(parsed.meta.toc_label) : DEFAULT_TOC_LABEL;
  const rendered = markdownToHtml(parsed.body);

  const record = {
    id: slug,
    title,
    slug,
    date,
    lastmod,
    author: parsed.meta.author || "",
    description,
    path: "content/articles/" + fileName,
    html_path: "content/articles/" + fileName.replace(/\.md$/i, ".html"),
    tags: normalizeArray(parsed.meta.tags),
    categories: normalizeArray(parsed.meta.categories),
    draft,
    canonical_url: parsed.meta.canonical_url || "",
    toc: tocEnabled,
    toc_sticky: tocSticky,
    toc_label: tocLabel
  };

  return {
    record,
    html: buildArticlePage(record, rendered.html, {
      enabled: tocEnabled,
      sticky: tocSticky,
      label: tocLabel,
      headings: rendered.headings
    })
  };
}

function generateIndex() {
  if (!fs.existsSync(articlesDir)) {
    throw new Error("Missing content/articles directory");
  }

  const files = fs
    .readdirSync(articlesDir)
    .filter((name) => name.endsWith(".md"));

  const bundles = files
    .map((fileName) => buildArticleBundle(fileName))
    .filter((item) => !item.record.draft)
    .sort((a, b) => {
      const aTime = new Date(a.record.date).getTime() || 0;
      const bTime = new Date(b.record.date).getTime() || 0;
      return bTime - aTime;
    });

  bundles.forEach((item) => {
    const htmlTarget = path.join(repoRoot, item.record.html_path);
    fs.writeFileSync(htmlTarget, item.html, "utf8");
  });

  const records = bundles.map((item) => item.record);

  fs.writeFileSync(outputPath, JSON.stringify(records, null, 2) + "\n", "utf8");
  return records.length;
}

try {
  const count = generateIndex();
  console.log("Generated articles index with " + count + " published article(s).");
} catch (error) {
  console.error(error.message);
  process.exit(1);
}

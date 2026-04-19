(function () {
  "use strict";

  var INDEX_PATH = "content/articles/articles-index.json";

  function escapeHtml(input) {
    return String(input || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function parseScalar(value) {
    var trimmed = (value || "").trim();
    if (!trimmed) return "";

    if ((trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
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
    var text = String(markdown || "");
    var lines = text.split(/\r?\n/);

    if (!lines.length || lines[0].trim() !== "---") {
      return { meta: {}, body: text };
    }

    var end = -1;
    for (var i = 1; i < lines.length; i += 1) {
      if (lines[i].trim() === "---") {
        end = i;
        break;
      }
    }

    if (end === -1) {
      return { meta: {}, body: text };
    }

    var yamlLines = lines.slice(1, end);
    var body = lines.slice(end + 1).join("\n");
    var meta = {};
    var currentListKey = null;

    for (var y = 0; y < yamlLines.length; y += 1) {
      var line = yamlLines[y];
      if (!line || !line.trim() || line.trim().startsWith("#")) {
        continue;
      }

      var listMatch = line.match(/^\s*-\s+(.*)$/);
      if (listMatch && currentListKey) {
        meta[currentListKey].push(parseScalar(listMatch[1]));
        continue;
      }

      var kvMatch = line.match(/^\s*([A-Za-z0-9_]+)\s*:\s*(.*)$/);
      if (!kvMatch) {
        currentListKey = null;
        continue;
      }

      var key = kvMatch[1];
      var rawValue = kvMatch[2];
      if (!rawValue) {
        meta[key] = [];
        currentListKey = key;
      } else {
        meta[key] = parseScalar(rawValue);
        currentListKey = null;
      }
    }

    return { meta: meta, body: body };
  }

  function formatDate(value) {
    if (!value) return "";
    var date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  }

  function normalizePath(input) {
    if (!input) return null;
    var normalized = String(input).replace(/\\/g, "/").trim();
    if (!normalized) return null;
    if (normalized.indexOf("..") !== -1) return null;
    if (normalized.startsWith("/")) return null;
    if (/^[A-Za-z]+:/.test(normalized)) return null;
    if (!normalized.startsWith("content/articles/")) return null;
    if (!normalized.endsWith(".md")) return null;
    return normalized;
  }

  function buildReaderUrl(path) {
    return "article.html?file=" + encodeURIComponent(path);
  }

  function renderMarkdown(markdown) {
    if (window.marked && typeof window.marked.parse === "function") {
      var rendered = window.marked.parse(markdown || "", {
        mangle: false,
        headerIds: true
      });

      if (window.DOMPurify && typeof window.DOMPurify.sanitize === "function") {
        return window.DOMPurify.sanitize(rendered);
      }

      return rendered;
    }

    return "<pre>" + escapeHtml(markdown) + "</pre>";
  }

  function hide(el) {
    if (el) {
      el.hidden = true;
    }
  }

  function show(el) {
    if (el) {
      el.hidden = false;
    }
  }

  function setArticleStatus(message, isError) {
    var statusEl = document.getElementById("article-status");
    if (!statusEl) return;

    statusEl.textContent = message;
    statusEl.classList.toggle("article-error", Boolean(isError));
    show(statusEl);
  }

  async function initArticlePage() {
    var titleEl = document.getElementById("article-title");
    var metaEl = document.getElementById("article-meta");
    var contentEl = document.getElementById("article-content");

    if (!titleEl || !metaEl || !contentEl) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var requested = params.get("file");
    var safePath = normalizePath(requested || "");

    if (!safePath) {
      titleEl.textContent = "Article not found";
      metaEl.textContent = "";
      hide(contentEl);
      setArticleStatus("Invalid article link. Please return to the blog page.", true);
      return;
    }

    setArticleStatus("Loading content...", false);

    try {
      var response = await fetch(safePath, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load article");
      }

      var markdown = await response.text();
      var parsed = parseFrontMatter(markdown);
      var title = parsed.meta.title || "Untitled Article";
      var dateText = formatDate(parsed.meta.date || parsed.meta.lastmod || "");
      var description = parsed.meta.description ? String(parsed.meta.description) : "";

      titleEl.textContent = title;
      metaEl.textContent = [dateText, description].filter(Boolean).join(" | ");
      document.title = title + " | Satyam Thakur";

      contentEl.innerHTML = renderMarkdown(parsed.body);
      show(contentEl);
      hide(document.getElementById("article-status"));

      if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
        window.MathJax.typesetPromise([contentEl]).catch(function () {
          // No-op when math typesetting fails.
        });
      }
    } catch (error) {
      titleEl.textContent = "Article unavailable";
      metaEl.textContent = "";
      hide(contentEl);
      setArticleStatus("Could not load this article right now. Please try again later.", true);
    }
  }

  function cardMetaText(item) {
    var date = formatDate(item.date || item.lastmod || "");
    return date || "Date not set";
  }

  function renderCards(items, container) {
    var html = items.map(function (item) {
      var title = escapeHtml(item.title || "Untitled Article");
      var description = escapeHtml(item.description || "No description available.");
      var date = escapeHtml(cardMetaText(item));
      var safePath = normalizePath(item.path || "");
      if (!safePath) {
        return "";
      }

      return "" +
        "<div class=\"blog-card\">" +
          "<div class=\"blog-meta\">" +
            "<i class=\"far fa-calendar\"></i>" +
            "<span>" + date + "</span>" +
            "<span class=\"separator\">•</span>" +
            "<i class=\"fas fa-file-alt\"></i>" +
            "<span>Article</span>" +
          "</div>" +
          "<h3><a href=\"" + buildReaderUrl(safePath) + "\">" + title + "</a></h3>" +
          "<p>" + description + "</p>" +
          "<a href=\"" + buildReaderUrl(safePath) + "\" class=\"read-more\">Read more →</a>" +
        "</div>";
    }).join("");

    container.innerHTML = html;
  }

  async function initBlogPage() {
    var postsEl = document.getElementById("blog-posts");
    if (!postsEl) {
      return;
    }

    var emptyEl = document.getElementById("blog-empty-state");
    var errorEl = document.getElementById("blog-error-state");

    hide(emptyEl);
    hide(errorEl);
    postsEl.innerHTML = "<div class=\"blog-card\">Loading articles...</div>";

    try {
      var response = await fetch(INDEX_PATH, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Index fetch failed");
      }

      var entries = await response.json();
      var published = Array.isArray(entries)
        ? entries.filter(function (item) {
            return item && item.path && item.draft !== true;
          })
        : [];

      if (!published.length) {
        postsEl.innerHTML = "";
        show(emptyEl);
        return;
      }

      renderCards(published, postsEl);
    } catch (error) {
      postsEl.innerHTML = "";
      show(errorEl);
    }
  }

  window.ArticleRenderer = {
    initArticlePage: initArticlePage,
    initBlogPage: initBlogPage,
    parseFrontMatter: parseFrontMatter
  };
})();

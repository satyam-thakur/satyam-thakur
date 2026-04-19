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

  function normalizeArticleUrl(input) {
    if (!input) return null;
    var normalized = String(input).replace(/\\/g, "/").trim().replace(/^\.\//, "");
    if (!normalized) return null;
    if (normalized.indexOf("..") !== -1) return null;
    if (normalized.startsWith("/")) return null;
    if (/^[A-Za-z]+:/.test(normalized)) return null;
    if (!normalized.startsWith("content/articles/")) return null;
    if (!normalized.endsWith(".html")) return null;
    return normalized;
  }

  function deriveArticleUrl(item) {
    if (item && item.html_path) {
      return normalizeArticleUrl(item.html_path);
    }

    if (item && item.path) {
      return normalizeArticleUrl(String(item.path).replace(/\.md$/i, ".html"));
    }

    return null;
  }

  function hide(el) {
    if (el) el.hidden = true;
  }

  function show(el) {
    if (el) el.hidden = false;
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
      var articleUrl = deriveArticleUrl(item);
      if (!articleUrl) {
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
          "<h3><a href=\"" + articleUrl + "\">" + title + "</a></h3>" +
          "<p>" + description + "</p>" +
          "<a href=\"" + articleUrl + "\" class=\"read-more\">Read more →</a>" +
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
            return item && item.draft !== true && deriveArticleUrl(item);
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
    initBlogPage: initBlogPage
  };
})();

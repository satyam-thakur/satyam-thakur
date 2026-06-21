(function () {
  "use strict";

  var INDEX_PATH = "content/articles/articles-index.json";

  var state = {
    allItems: [],
    query: "",
    selectedCategories: new Set(),
    selectedTags: new Set()
  };

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

  function normalizeText(value) {
    return String(value || "").trim();
  }

  function parseBracketArrayString(value) {
    var text = normalizeText(value);
    if (!text.startsWith("[") || !text.endsWith("]")) {
      return null;
    }

    var inner = text.slice(1, -1).trim();
    if (!inner) {
      return [];
    }

    return inner.split(",").map(function (item) {
      return normalizeText(item).replace(/^['"]|['"]$/g, "");
    }).filter(Boolean);
  }

  function normalizeStringArray(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      if (value.length === 1) {
        var parsedSingle = parseBracketArrayString(value[0]);
        if (parsedSingle) return parsedSingle;
      }

      return value.map(function (item) {
        return normalizeText(item).replace(/^['"]|['"]$/g, "");
      }).filter(Boolean);
    }

    var parsed = parseBracketArrayString(value);
    if (parsed) return parsed;

    return [normalizeText(value).replace(/^['"]|['"]$/g, "")].filter(Boolean);
  }

  function prepareItem(item) {
    var categories = normalizeStringArray(item.categories);
    var tags = normalizeStringArray(item.tags);
    return Object.assign({}, item, {
      categories: categories,
      tags: tags
    });
  }

  function categoriesLabel(item) {
    if (!item || !item.categories || !item.categories.length) {
      return "Article";
    }

    return item.categories.join(", ");
  }

  function renderTags(item) {
    if (!item || !item.tags || !item.tags.length) {
      return "";
    }

    var tagsHtml = item.tags.map(function (tag) {
      return "<span class=\"blog-tag-chip\">" + escapeHtml(tag) + "</span>";
    }).join("");

    return "<div class=\"blog-tags\" aria-label=\"Tags\">" + tagsHtml + "</div>";
  }

  function renderViewsBadge(item) {
    if (!item || !item.views) return "";
    var slug = escapeHtml(item.slug || item.id || "");
    if (!slug) return "";
    return "<span class=\"separator\">•</span>" +
      "<img class=\"blog-views-badge\" src=\"https://hits.sh/satyamthakur.com.np/" + slug + ".svg?view=total&label=Views&color=6b21a8&style=flat-square\" alt=\"Views\" loading=\"lazy\">";
  }

  function renderCards(items, container) {
    var html = items.map(function (item) {
      var title = escapeHtml(item.title || "Untitled Article");
      var description = escapeHtml(item.description || "No description available.");
      var date = escapeHtml(cardMetaText(item));
      var categoryText = escapeHtml(categoriesLabel(item));
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
            "<i class=\"fas fa-tags\"></i>" +
            "<span>" + categoryText + "</span>" +
            renderViewsBadge(item) +
          "</div>" +
          "<h3><a href=\"" + articleUrl + "\">" + title + "</a></h3>" +
          "<p>" + description + "</p>" +
          renderTags(item) +
          "<a href=\"" + articleUrl + "\" class=\"read-more\">Read more →</a>" +
        "</div>";
    }).join("");

    container.innerHTML = html;
  }

  function uniqSorted(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (a, b) {
      return a.localeCompare(b);
    });
  }

  function sortByDateDesc(items) {
    return items.slice().sort(function (a, b) {
      var aTime = new Date(a.date || a.lastmod || 0).getTime() || 0;
      var bTime = new Date(b.date || b.lastmod || 0).getTime() || 0;
      return bTime - aTime;
    });
  }

  function buildFilterButton(value, kind, isActive) {
    var activeClass = isActive ? " is-active" : "";
    var pressed = isActive ? "true" : "false";
    return "<button type=\"button\" class=\"blog-filter-chip" + activeClass + "\" data-filter-kind=\"" + kind + "\" data-filter-value=\"" + escapeHtml(value) + "\" aria-pressed=\"" + pressed + "\">" + escapeHtml(value) + "</button>";
  }

  function renderFilterChips(values, container, kind, selectedSet) {
    if (!container) return;
    if (!values.length) {
      container.innerHTML = "<span class=\"blog-filter-empty\">No " + kind + " available</span>";
      return;
    }

    container.innerHTML = values.map(function (value) {
      return buildFilterButton(value, kind, selectedSet.has(value));
    }).join("");
  }

  function updateDropdownSummary(summaryEl, label, selectedSet, totalValues) {
    if (!summaryEl) return;

    var selectedCount = selectedSet.size;
    if (selectedCount > 0) {
      summaryEl.textContent = label + " (" + selectedCount + ")";
      return;
    }

    summaryEl.textContent = label + " (" + totalValues + ")";
  }

  function updateActiveFiltersSummary() {
    var summaryEl = document.getElementById("blog-active-filters");
    if (!summaryEl) return;

    var parts = [];
    var query = normalizeText(state.query);

    if (query) {
      parts.push("Search: \"" + query + "\"");
    }

    if (state.selectedCategories.size) {
      parts.push("Categories: " + Array.from(state.selectedCategories).join(", "));
    }

    if (state.selectedTags.size) {
      parts.push("Tags: " + Array.from(state.selectedTags).join(", "));
    }

    summaryEl.textContent = parts.length ? parts.join(" | ") : "No filters applied";
  }

  function itemMatchesQuery(item, queryText) {
    if (!queryText) return true;

    var haystack = [
      item.title,
      item.description,
      item.categories.join(" "),
      item.tags.join(" ")
    ].join(" ").toLowerCase();

    return haystack.indexOf(queryText) !== -1;
  }

  function itemMatchesFilter(item, selectedCategories, selectedTags) {
    var hasCategoryFilter = selectedCategories.size > 0;
    var hasTagFilter = selectedTags.size > 0;

    if (!hasCategoryFilter && !hasTagFilter) {
      return true;
    }

    var categoryMatch = item.categories.some(function (category) {
      return selectedCategories.has(category);
    });

    var tagMatch = item.tags.some(function (tag) {
      return selectedTags.has(tag);
    });

    return categoryMatch || tagMatch;
  }

  function getFilteredItems() {
    var queryText = state.query.toLowerCase();
    return sortByDateDesc(state.allItems).filter(function (item) {
      return itemMatchesQuery(item, queryText) && itemMatchesFilter(item, state.selectedCategories, state.selectedTags);
    });
  }

  function updateResults(postsEl, emptyEl) {
    var filtered = getFilteredItems();

    if (!filtered.length) {
      postsEl.innerHTML = "";
      show(emptyEl);
      return;
    }

    hide(emptyEl);
    renderCards(filtered, postsEl);
  }

  function syncFilterUI() {
    var categoriesEl = document.getElementById("blog-category-filters");
    var tagsEl = document.getElementById("blog-tag-filters");
    var categorySummaryEl = document.getElementById("blog-category-summary");
    var tagSummaryEl = document.getElementById("blog-tag-summary");

    var allCategories = uniqSorted(state.allItems.reduce(function (acc, item) {
      return acc.concat(item.categories);
    }, []));

    var allTags = uniqSorted(state.allItems.reduce(function (acc, item) {
      return acc.concat(item.tags);
    }, []));

    renderFilterChips(allCategories, categoriesEl, "category", state.selectedCategories);
    renderFilterChips(allTags, tagsEl, "tag", state.selectedTags);
    updateDropdownSummary(categorySummaryEl, "Categories", state.selectedCategories, allCategories.length);
    updateDropdownSummary(tagSummaryEl, "Tags", state.selectedTags, allTags.length);
    updateActiveFiltersSummary();
  }

  function attachFilterHandlers(postsEl, emptyEl) {
    var searchEl = document.getElementById("blog-search-input");
    var filtersRoot = document.getElementById("blog-filters-panel");
    var clearEl = document.getElementById("blog-clear-filters");
    var categoryDropdown = document.getElementById("blog-category-dropdown");
    var tagDropdown = document.getElementById("blog-tag-dropdown");
    var filtersToggle = document.getElementById("blog-filters-toggle");

    function setFiltersVisibility(show) {
      if (!filtersRoot || !filtersToggle) return;

      filtersRoot.hidden = !show;
      filtersRoot.classList.toggle("is-open", show);
      filtersToggle.setAttribute("aria-expanded", show ? "true" : "false");

      if (!show) {
        if (categoryDropdown) categoryDropdown.removeAttribute("open");
        if (tagDropdown) tagDropdown.removeAttribute("open");
        return;
      }

      if (searchEl) {
        searchEl.focus();
      }
    }

    if (filtersToggle) {
      filtersToggle.addEventListener("click", function () {
        var isVisible = !filtersRoot.hidden;
        setFiltersVisibility(!isVisible);
      });
    }

    if (searchEl) {
      searchEl.addEventListener("input", function (event) {
        state.query = normalizeText(event.target.value);
        updateResults(postsEl, emptyEl);
      });
    }

    if (filtersRoot) {
      filtersRoot.addEventListener("click", function (event) {
        var target = event.target && event.target.closest ? event.target.closest(".blog-filter-chip") : null;
        if (!target) return;

        var kind = target.getAttribute("data-filter-kind");
        var value = target.getAttribute("data-filter-value");
        if (!kind || !value) return;

        var selectedSet = kind === "category" ? state.selectedCategories : state.selectedTags;
        if (selectedSet.has(value)) {
          selectedSet.delete(value);
        } else {
          selectedSet.add(value);
        }

        syncFilterUI();
        updateResults(postsEl, emptyEl);
      });
    }

    document.addEventListener("click", function (event) {
      if (!filtersRoot || filtersRoot.contains(event.target)) {
        return;
      }

      if (categoryDropdown) {
        categoryDropdown.removeAttribute("open");
      }

      if (tagDropdown) {
        tagDropdown.removeAttribute("open");
      }

      if (filtersToggle && filtersRoot && !filtersRoot.hidden) {
        filtersToggle.focus();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key !== "Escape") {
        return;
      }

      if (categoryDropdown) {
        categoryDropdown.removeAttribute("open");
      }

      if (tagDropdown) {
        tagDropdown.removeAttribute("open");
      }
    });

    if (clearEl) {
      clearEl.addEventListener("click", function () {
        state.query = "";
        state.selectedCategories.clear();
        state.selectedTags.clear();

        if (searchEl) {
          searchEl.value = "";
        }

        syncFilterUI();
        updateResults(postsEl, emptyEl);

        if (categoryDropdown) {
          categoryDropdown.removeAttribute("open");
        }

        if (tagDropdown) {
          tagDropdown.removeAttribute("open");
        }
      });
    }

    if (filtersRoot) {
      setFiltersVisibility(false);
    }
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
          }).map(prepareItem)
        : [];

      state.allItems = published;

      if (!published.length) {
        postsEl.innerHTML = "";
        show(emptyEl);
        return;
      }

      hide(emptyEl);
      syncFilterUI();
      attachFilterHandlers(postsEl, emptyEl);
      updateResults(postsEl, emptyEl);
    } catch (error) {
      postsEl.innerHTML = "";
      show(errorEl);
    }
  }

  async function initFeaturedBlogPosts(options) {
    var config = options || {};
    var containerId = config.containerId || "featured-blog-posts";
    var limit = Number(config.limit || 2);
    var container = document.getElementById(containerId);

    if (!container) {
      return;
    }

    try {
      var response = await fetch(INDEX_PATH, { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Index fetch failed");
      }

      var entries = await response.json();
      var published = Array.isArray(entries)
        ? entries.filter(function (item) {
            return item && item.draft !== true && deriveArticleUrl(item);
          }).map(prepareItem)
        : [];

      var sorted = sortByDateDesc(published);
      var sliceCount = limit > 0 ? limit : 2;
      var items = sorted.slice(0, sliceCount);

      if (!items.length) {
        container.innerHTML = '<div class="text-center w-100" style="padding: 2rem;"><p>No blog posts available.</p></div>';
        return;
      }

      renderCards(items, container);
    } catch (error) {
      container.innerHTML = '<div class="text-center w-100" style="padding: 2rem;"><p>Unable to load blog posts. Please visit the <a href="blog.html">blog page</a>.</p></div>';
    }
  }

  window.ArticleRenderer = {
    initBlogPage: initBlogPage,
    initFeaturedBlogPosts: initFeaturedBlogPosts
  };
})();

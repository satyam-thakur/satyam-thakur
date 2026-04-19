const fs = require("fs");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const articlesDir = path.join(repoRoot, "content", "articles");
const outputPath = path.join(articlesDir, "articles-index.json");

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

function toIsoDate(input, fallbackDate) {
  const date = input ? new Date(input) : null;
  if (date && !Number.isNaN(date.getTime())) {
    return date.toISOString().slice(0, 10);
  }
  return fallbackDate;
}

function buildIndexRecord(fileName) {
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

  return {
    id: slug,
    title,
    slug,
    date,
    lastmod,
    author: parsed.meta.author || "",
    description,
    path: "content/articles/" + fileName,
    tags: normalizeArray(parsed.meta.tags),
    categories: normalizeArray(parsed.meta.categories),
    draft,
    canonical_url: parsed.meta.canonical_url || ""
  };
}

function generateIndex() {
  if (!fs.existsSync(articlesDir)) {
    throw new Error("Missing content/articles directory");
  }

  const files = fs
    .readdirSync(articlesDir)
    .filter((name) => name.endsWith(".md"));

  const records = files
    .map((fileName) => buildIndexRecord(fileName))
    .filter((record) => !record.draft)
    .sort((a, b) => {
      const aTime = new Date(a.date).getTime() || 0;
      const bTime = new Date(b.date).getTime() || 0;
      return bTime - aTime;
    });

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

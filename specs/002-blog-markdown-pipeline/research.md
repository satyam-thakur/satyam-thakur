# Research: Blog Views Analytics

## Decision: View Counter Service

**Decision**: Use `komarev.com/ghpvc` (GitHub Profile Views Counter) for per-page view tracking.

**Rationale**:
- Already used in the project's `README.md` — the user is familiar with it
- Zero configuration: no API keys, accounts, or backend required
- Works with static sites: just an `<img>` tag
- Returns an SVG badge image that looks clean and professional
- Counts are persisted server-side by komarev's infrastructure

**Alternatives considered**:

| Service | Pros | Cons | Verdict |
|---------|------|------|---------|
| `komarev.com/ghpvc` | Already used in project; zero-config; reliable | Designed for GitHub profiles; one counter per "username" | ✅ Selected — repurpose `username` param as page identifier |
| `hits.sh` | Purpose-built for arbitrary pages; cleaner API | Requires a different URL pattern; less familiar | Good alternative if komarev doesn't work well |
| `visitor-badge.laobi.icu` | Similar concept to komarev | Less reliable uptime; Chinese origin may have latency | Rejected |
| GoatCounter | Full analytics dashboard; privacy-friendly | Requires account setup + JS snippet | Overkill for a simple badge |
| Self-hosted counter | Full control | Requires a server/serverless function; maintenance burden | Rejected for simplicity |

**How komarev will be adapted**: Each article gets a unique counter by using the URL pattern:
```
https://komarev.com/ghpvc/?username=satyam-blog-{slug}&label=Views&color=blueviolet&style=flat-square
```

Where `{slug}` is the article's existing slug from `articles-index.json` (e.g., `2026-04-20_RDMA-Infiband_vs_RoCE`).

The full identifier becomes: `satyam-blog-2026-04-20_RDMA-Infiband_vs_RoCE`

## Decision: Badge Display Style

**Decision**: Embed the badge as a visible `<img>` element inline with existing metadata.

**Rationale**:
- Simplest implementation: pure HTML, no JavaScript required for the counter itself
- The blueviolet flat-square style matches the existing README badge aesthetic
- Placed in the `.blog-meta` area alongside date and category, it follows the established icon + text pattern
- Constitution Principle III (UX Consistency) is maintained by using the same visual language

## Decision: Badge Placement

**Decision**: Place the badge in two locations:
1. **Blog listing cards** (`blog.html`): In the `.blog-meta` div, after the category label
2. **Article pages** (generated `.html`): In the article header, next to the publish date

**Rationale**:
- Users see view counts while browsing the blog listing (social proof / engagement signal)
- Users see view counts on the article itself (validates that the content is being read)
- Both locations already have a meta-info area that accommodates this naturally

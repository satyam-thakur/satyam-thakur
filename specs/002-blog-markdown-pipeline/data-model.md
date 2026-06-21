# Data Model: Blog Views Analytics

## Entities

This feature introduces no new data entities or persistent storage. View counts are managed entirely by the external komarev service.

### Existing Entity: Article Record (articles-index.json)

No schema changes needed. The `slug` field already exists and serves as the unique identifier for constructing badge URLs.

```json
{
  "id": "2026-04-20_RDMA-Infiband_vs_RoCE",
  "slug": "2026-04-20_RDMA-Infiband_vs_RoCE",
  "title": "...",
  "date": "2026-04-19",
  "...": "..."
}
```

### Derived: Badge URL Pattern

```
https://komarev.com/ghpvc/?username=satyam-blog-{slug}&label=Views&color=blueviolet&style=flat-square
```

| Parameter | Value | Purpose |
|-----------|-------|---------|
| `username` | `satyam-blog-{slug}` | Unique counter identifier per article |
| `label` | `Views` | Text label on the badge |
| `color` | `blueviolet` | Badge color (matches README badge) |
| `style` | `flat-square` | Badge shape (matches README badge) |

### State Transitions

None. View counts are monotonically increasing; there is no reset or decrement operation.

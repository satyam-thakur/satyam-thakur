# Tasks: Blog Markdown Reader + Auto Listing

**Input**: Design documents from /specs/002-blog-markdown-pipeline/
**Prerequisites**: plan.md and spec.md

## Phase 1: Setup (Shared Infrastructure)

- [X] T001 Create article reader page scaffold in article.html
- [X] T002 Create markdown renderer script scaffold in js/article-renderer.js
- [X] T003 [P] Create article index generator script scaffold in tools/generate-articles-index.js
- [X] T004 [P] Create generated index file placeholder in content/articles/articles-index.json
- [X] T005 [P] Create CI workflow scaffold for index generation in .github/workflows/articles-index.yml

## Phase 2: Foundational (Blocking Prerequisites)

- [X] T006 Implement front matter parser utility in tools/generate-articles-index.js
- [X] T007 [P] Implement markdown file discovery for content/articles in tools/generate-articles-index.js
- [X] T008 Implement draft filtering and date sorting in tools/generate-articles-index.js
- [X] T009 Implement deterministic JSON output writer in tools/generate-articles-index.js
- [X] T010 Add workflow trigger and commit-back logic for generated index in .github/workflows/articles-index.yml
- [X] T011 Define reader query parameter contract and path allowlist check in js/article-renderer.js

## Phase 3: User Story 1 - Read Article In Themed Page (Priority: P1)

**Goal**: Open a dedicated page that renders markdown as readable themed content.
**Independent Test**: Click an article link from blog page and verify the article opens in a scrollable themed page with title and body.

- [X] T012 [US1] Add article content container and states in article.html
- [X] T013 [US1] Implement markdown fetch by file query parameter in js/article-renderer.js
- [X] T014 [US1] Implement sanitized markdown-to-HTML rendering in js/article-renderer.js
- [X] T015 [US1] Render front matter metadata in article.html
- [X] T016 [US1] Reuse navbar, theme, and footer behavior in article.html
- [X] T017 [US1] Add scoped reader typography and code/image styles in css/custom.css

## Phase 4: User Story 2 - Auto List Markdown Articles (Priority: P2)

**Goal**: Blog page cards are generated from content/articles metadata rather than hardcoded HTML.
**Independent Test**: Blog page renders cards from generated index and each Read more points to the article reader URL.

- [X] T018 [US2] Add dynamic article list mount container in blog.html
- [X] T019 [US2] Implement index fetch and card rendering logic in js/article-renderer.js
- [X] T020 [US2] Replace hardcoded blog card usage with dynamic rendering in blog.html
- [X] T021 [US2] Generate reader URLs pointing to article.html with markdown file parameter in js/article-renderer.js
- [X] T022 [US2] Add graceful fallback block when index fetch fails in blog.html

## Phase 5: User Story 3 - Auto Publish New Markdown Posts (Priority: P3)

**Goal**: Adding a markdown file in content/articles automatically appears on blog page after CI run.
**Independent Test**: Add a new markdown file with front matter, push branch, and verify index updates and new card appears.

- [X] T023 [US3] Implement metadata extraction map in tools/generate-articles-index.js
- [X] T024 [US3] Ensure workflow runs generator and commits content/articles/articles-index.json in .github/workflows/articles-index.yml
- [X] T025 [US3] Add local generator command documentation in specs/002-blog-markdown-pipeline/quickstart.md
- [X] T026 [US3] Define required front matter conventions for authors in specs/002-blog-markdown-pipeline/quickstart.md

## Final Phase: Polish & Cross-Cutting Concerns

- [X] T027 [P] Normalize canonical and alternate links in blog.html
- [X] T028 [P] Add empty-state messaging for zero published articles in blog.html
- [ ] T029 Verify light/dark mode parity for reader and blog cards in css/custom.css
- [ ] T030 Run end-to-end manual verification checklist in specs/002-blog-markdown-pipeline/quickstart.md

## Dependencies & Execution Order

- Setup then Foundational before user story phases.
- US1 first for MVP.
- US2 after foundational and reader URL contract.
- US3 after generator and workflow are in place.
- Polish after all stories.

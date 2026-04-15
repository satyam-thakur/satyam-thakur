<!--
Sync Impact Report

- Version change: unversioned/template → 1.0.0
- Principles: replaced placeholders with 4 principles focused on code quality, testing, UX consistency, and performance
- Added sections: Quality Gates
- Removed sections: none (template placeholders replaced)
- Templates requiring updates:
	- ✅ .specify/templates/plan-template.md (reviewed)
	- ✅ .specify/templates/spec-template.md (reviewed)
	- ✅ .specify/templates/tasks-template.md (reviewed)
- Follow-up TODOs: none
-->

# Satyam Thakur Portfolio Constitution

These principles define the bar for changes to this portfolio site: readable code, trustworthy behavior, consistent user experience, and fast pages.

## Core Principles

### I. Code Quality: Clarity Beats Cleverness
Write code that a future you can understand quickly.

- Changes MUST favor small, named functions over deeply nested logic.
- Markup MUST be semantic and structured (avoid div soup).
- Changes MUST avoid duplicating logic and styles by reusing existing patterns and utilities.
- Changes MUST remove dead code and unused assets when they become obsolete.
- Any deliberate tradeoff MUST be documented in the change description.

### II. Testing Standards: Ship With Confidence
Behavior changes MUST be easy to verify and hard to regress.

- Every bug fix MUST include a reproduction and a verification step.
- New JavaScript logic MUST be written to be testable (prefer pure functions where possible).
- If a test harness exists (or is introduced), changes MUST add/extend automated tests for new behavior.
- When automation is not practical, changes MUST include a minimal manual test checklist.

### III. UX Consistency: One Site, One Experience
Users MUST not feel like they’ve switched to a different product.

- Changes MUST reuse existing layout, typography, and components rather than inventing new styles.
- Navigation and key affordances MUST remain consistent across pages.
- Pages MUST be responsive at common breakpoints (avoid desktop-only layouts).
- Changes MUST meet basic accessibility: labels for controls, logical heading order, keyboard operability.

### IV. Performance: Fast by Default
Performance is a feature; regressions are treated as bugs.

- Changes MUST avoid introducing render-blocking work on the critical path.
- Changes SHOULD prefer local, optimized assets over heavy new dependencies.
- Images MUST be appropriately sized and compressed (avoid shipping giant originals).
- Changes MUST defer non-critical scripts and avoid unnecessary DOM work.

## Quality Gates

- Pages touched by the change MUST have no console errors on load.
- Pages touched by the change MUST have no obvious visual regressions in both light and dark mode (if applicable).
- New functionality MUST include a “how to verify” note (automated test or manual steps).
- Changes MUST consider performance impact (what changed and why it won’t slow down key pages).

## Governance

- This constitution is the default tie-breaker when guidance is ambiguous.
- Any change that knowingly violates a principle must justify the exception and include a mitigation plan.
- Amendments should be intentional: update this document and bump the version.

**Version**: 1.0.0 | **Ratified**: 2026-04-15 | **Last Amended**: 2026-04-15

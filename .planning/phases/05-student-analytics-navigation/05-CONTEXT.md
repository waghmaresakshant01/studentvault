---
phase: "05"
name: "student-analytics-navigation"
created: 2026-06-07
---

# Phase 5: student-analytics-navigation — Context

## Decisions

- We will implement a tabbed router using Vanilla JS to display three distinct sections:
  1. **Dashboard** view (`#dashboard`): displays total stats, recent student additions (last 3), quick action shortcuts to toggle the registration drawer, and an animated visual progress widget.
  2. **Students Directory** view (`#students`): houses the complete records table, live search bar, and category filters.
  3. **Analytics** view (`#analytics`): displays rich visual charts of branch distribution and year distribution (integrated cleanly with Chart.js using dynamic data from the REST API).
- We will update navbar links to trigger view toggles using URL hash changes (hashchange event listener), which enables browser history back/forward button compatibility.
- For analytics rendering, we will load `Chart.js` from a CDN (e.g. `https://cdn.jsdelivr.net/npm/chart.js`) dynamically in `index.html`.

## Discretion Areas

- The design of the visual widgets on the dashboard (e.g. recent cards, animated indicators).
- The specific colors used in the Chart.js graphs (which should match the Shinkei dark/orange/matte color palette).

## Deferred Ideas

- Persistent router state on page reload (currently handled by defaults or hash parsing on DOMContentLoaded).

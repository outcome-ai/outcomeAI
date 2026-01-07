Outcome AI Command Center — FIX16 (Phase 2 Mock Preview)

What this build is for
- This is a MOCK/PREVIEW build to make Phase 2 changes visible.
- Preview UI is ON by default so you can clearly see what changed.

How to use
- Open index.html normally. You should see a "Preview Mode" banner at the top.
- Click "Hide" to disable preview UI (stored in localStorage).
- Optional: you can still use ?preview=1 or ?debug=1.

What to look for
- Economic State pills on COI list items.
- Preview panel (right) with counts + $ totals by economic state.

Notes
- This is not intended for dealer deployment as-is. We'll disable preview-by-default after you approve the mock.

FIX16 NOTE: This is a MOCK-PREVIEW build.
- Preview Mode is ON by default (banner + econ-state pills + preview panel).
- To hide preview UI, click 'Hide' on the banner (stores localStorage oa_preview_econ=0).
- To re-enable, clear site data/localStorage or set oa_preview_econ=1 and refresh, or add ?preview=1.

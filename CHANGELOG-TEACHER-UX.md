# Teacher UX update — iOS Student Card

## Included
- Attendance list uses larger touch targets and more spacious student cards. Saving now sends explicit empty statuses so teachers can clear previously saved attendance.
- Growth page adds mobile-first student cards with numeric-friendly weight/height inputs and a note field. All students are sent on save so cleared measurements can be removed; note-only records are retained.
- Health-check page adds mobile-first student cards with segmented choice buttons. Empty choices are sent explicitly to clear old values.
- Savings page adds mobile-first student cards with day-by-day numeric inputs. Daily, per-student and grand totals update while editing. Empty cells are sent as explicit deletions.
- Attendance GET now returns the student ID separately from the attendance-row ID, fixing incorrect student-to-record mapping when a saved attendance row exists.
- API endpoints for attendance, growth, health checks and savings now support explicit clearing/deletion without changing existing table schemas.

## Preserved
- Existing D1 tables, migrations, data model, authentication, classroom permissions, reports, and existing desktop table views. No migration or destructive database operation was added.

## Validation performed
- JavaScript syntax checks passed for the four modified API handlers and inline module scripts in the public HTML pages.
- Runtime integration against the live Cloudflare D1 database and device/browser visual testing have not been performed in this environment. Deploy to a staging environment and verify with test records before production use.

## Follow-up recommended
- The activities page currently derives activity completion from attendance and remains read-only. If teachers must record milk/toothbrushing/meal/cleaning separately, implement the existing `activity_overrides` table with a dedicated API and UI in a separate, tested step.

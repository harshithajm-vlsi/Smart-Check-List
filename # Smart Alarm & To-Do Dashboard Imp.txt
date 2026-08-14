# Smart Alarm & To-Do Dashboard Implementation Plan

## Goal Description
Build a premium‑look React dashboard that combines task management and alarm functionality. Features include:
- Sea‑green / teal primary color with white background, light/dark mode toggle.
- Glassmorphism cards.
- Home page greeting, live date/day/time.
- Full CRUD for tasks and alarms (add, edit, delete, mark complete, priority, due date, preferred time, snooze, sound selection).
- Browser notifications for reminders.
- Responsive layout for mobile, tablet, desktop.

## User Review Required
> [!IMPORTANT]
> Confirm the overall component structure and any third‑party libraries (e.g., `date-fns`, `uuid`, `rrule`, `idb-keyval`).
> Approve the CSS variable names for theming.

## Open Questions
- Preferred storage: keep using `localStorage` for tasks/alarms or migrate to IndexedDB for richer data?
- Sound files: use the built‑in sounds in `src/assets/sounds/` plus user‑uploaded MP3s (IndexedDB).
- Notification scheduling: use existing `NotificationService` with `setTimeout` and service worker for background.

## Proposed Changes
---
### Components
- **src/components/Header.jsx** – Greeting, live date/time, theme toggle.
- **src/components/TaskCard.jsx** – Display task details, edit/delete/complete actions.
- **src/components/AlarmCard.jsx** – Show alarm info, edit/delete, snooze button.
- **src/components/TaskForm.jsx** – Modal for creating/editing tasks (priority, due date, preferred time).
- **src/components/AlarmForm.jsx** – Modal for creating/editing alarms (recurrence, sound selection).
- **src/components/NotificationSettings.jsx** – Configure reminder offsets.
- **src/components/ThemeToggle.jsx** – Light/dark mode switch.
---
### Pages
- **src/pages/Dashboard.jsx** – Home view with greeting, stats, lists of tasks and alarms.
- **src/pages/Alarms.jsx** – Manage alarms list and form.
- **src/pages/Tasks.jsx** (new) – Manage tasks list and form.
---
### Services
- **src/services/TaskService.js** – CRUD operations, persistence.
- **src/services/AlarmService.js** – CRUD, recurrence (using `rrule`).
- **src/services/SoundService.js** – Play built‑in/user sounds, preview.
- Extend **NotificationService.js** to schedule task/alarm reminders.
---
### Styles
- **src/styles/theme.css** – CSS variables for `--color-primary`, `--color-bg`, `--color-bg-dark`, glassmorphism card class.
- Update **src/index.css** to import theme and set dark mode via `[data-theme="dark"]`.
---
### Utilities
- **src/utils/date.js** – Helpers for formatting live date/time.
- **src/utils/storage.js** – Wrapper around `localStorage` (or IndexedDB if chosen).
---
## Verification Plan
### Automated Tests
- Jest tests for TaskService and AlarmService persistence.
- Unit tests for date utils and theme toggle.
### Manual Verification
- Run `npm run dev` and verify UI loads with Sea‑green theme.
- Add/edit/delete tasks and alarms, ensure data persists across reloads.
- Confirm notifications fire at configured offsets.
- Test dark mode toggle and glassmorphism cards on desktop and mobile viewports.
- Verify alarm sound playback and snooze functionality.

**Next Steps**: Review this plan and approve or provide adjustments.

# Venue Page Test Descriptions

This directory contains the test suites for the Venue-specific pages and components of the NightGuard frontend.

Venue routes are now dynamic (`/venue/[id]/...`). Many tests mock `next/navigation` (`useParams`, `usePathname`, `useRouter`) so components can render without a real Next.js router.

## account.test.tsx

**Suite: Account Page (`/venue/[id]/account`)**

- **Page shell:** Verifies the "Account" heading renders after profile data loads.
- **Role + venue fields:** Asserts read-only `Venue Member` / `Admin` role values and the first venue name from `getVenues` appear as input display values.
- **Avatar fallback:** When `getMe` returns no first/last name, verifies the avatar initials fallback renders (first letter of the email).
- **Authentication:** Validates the "Log out" button exists and triggers Firebase `signOut` + navigation to `/login`.

## auth.test.tsx

**Suite: User & Authentication — Profile Display**

- **Sidebar integration:** Verifies `getMe` drives the sidebar display name (`John Doe`) and role label (`Venue Member` for `USER` profiles).
- **Error handling:** Verifies failures from `getMe` fall back to the Firebase email prefix.

**Suite: User & Authentication — Sign Out**

- **Dropdown flow:** Opens the user menu from the role row and verifies `Sign out` appears.
- **Redirect:** Confirms clicking `Sign out` calls Firebase `signOut` and routes to `/login`.

## capacity.test.tsx

**Suite: Capacity — Dashboard StatCard**

- **Integration:** Renders the venue dashboard (`/venue/[id]`) and verifies the `CURRENT CAPACITY` stat reflects mocked headcount + max capacity copy.

**Suite: Capacity StatCard — Isolated**

- **Component logic:** Tests `StatCard` in isolation for zero values, max subtitles, optional progress bars, and red accent usage for over-capacity values.

**Suite: Capacity Counter (future feature)**

- **Placeholders:** Contains `todo` definitions for future counter interactions (increment/decrement, limit editing, reset, over-limit styling).

## dashboard.test.tsx

**Suite: Dashboard Page (`/venue/[id]`)**

- **Primary stats:** Verifies the four dashboard tiles render: `ACTIVE INCIDENTS`, `TOTAL - LAST 24 HOURS`, `CURRENT CAPACITY`, and `Network Alerts` (title casing matches the UI).
- **Offender search:** Asserts the dashboard includes the offender search region (mocked via `data-testid="offender-search"`).

**Suite: StatCard Component**

- **Visuals:** Tests title/value/meta/subtitle rendering, optional meta omission, accent variants, and progress bar width styling.

**Suite: RecentReports Component**

- **Data display:** Verifies incident row rendering, empty states, loading spinners, and the `View All Reports` link.

**Suite: LiveActivity Component**

- **Header + default window:** Asserts `Live Activity` renders with the default time window label (`Last Hour`).
- **Empty network feed:** With no mocked activity, verifies the `No network activity yet` empty state.

## incidents.test.tsx

**Suite: Incidents Page (`/venue/[id]/incidents`)**

- **Query wiring:** Asserts `useIncidentsQuery` receives the selected venue id.
- **Empty / loading / error:** Covers the empty copy, spinner while loading, and the error string when the query fails.
- **Table rendering:** With mocked incidents, verifies formatted type labels, descriptions, and keyword chips.

## navigation.test.tsx

**Suite: Navigation — Sidebar Links**

- **Core nav:** Confirms `Dashboard`, `Incidents`, `Patrons`, `Logs`, `Offenders`, and `Staff` appear.
- **Network + settings:** Confirms `Network Alerts`, `Nearby Venues`, `Venue Preferences`, and `Account` appear.

**Suite: Navigation — Active Link Highlighting**

- **Active styles:** Asserts `Dashboard`, `Incidents`, and `Account` links pick up active styling on `/venue/v1`, `/venue/v1/incidents`, and `/venue/v1/account` respectively, and that `Dashboard` is inactive on the incidents route.

**Suite: Navigation — Link Destinations**

- **Dynamic hrefs:** Verifies links include the selected venue id (`/venue/v1/...`) for dashboard, incidents, patrons (capacity), logs, offenders, and account.

## new-report.test.tsx

**Suite: New Report — Dialog**

- **Open/close behavior:** Validates dialog title visibility when `open` toggles.
- **Incident type:** Covers placeholder, all incident type options, and selection.
- **Severity + description:** Covers severity button selection and textarea typing.
- **Keywords:** Covers add/remove flows (button + Enter), duplicate prevention, and clearing input after add.
- **Submission:** Covers disabled/enabled submit states, success UI, error surfacing, `Done` button after success, and `createIncident` payload expectations (including `offenderIds` and `mediaUrls` when no media is attached).

## offenders.test.tsx

**Suite: Offenders — Sidebar Link**

- **Navigation:** Confirms `Offenders` exists and links to `/venue/v1/offenders` when the selected venue id is `v1`.

**Suite: Offenders Page (future feature)**

- **Placeholders:** Contains `todo` definitions for future offenders table coverage.

## venue-switching.test.tsx

**Suite: Venue Switching — Context (`VenueProvider`)**

- **Selection rules:** With empty `useParams`, verifies the first venue becomes selected, all venues are exposed via context, and an empty venue list yields no selection.

**Suite: Venue Switching — Sidebar Dropdown**

- **Switcher UI:** Verifies the selected venue name + `City, ST` subtitle render, the dropdown lists other venues, and empty/loading copy (`No venues`, `Loading…`) appears appropriately.

## logs.test.tsx

**Suite: Venue Logs Page (`/venue/[id]/logs`)**

- **Query wiring:** Asserts `usePatronLogsQuery` receives the selected venue id.
- **Loading + empty states:** Covers the loading row copy and the default empty message when no logs exist.
- **Rendering + search:** With a mocked patron log, verifies name/decision rendering, the footer count string, and that the global search filters rows to the "no match" empty state.

## network-alerts-card.test.tsx

**Suite: `NetworkAlertsCard`**

- **Loading UI:** Asserts placeholders while notification activity is loading.
- **Counts:** Verifies total alert count and unique originating venue count from mocked activity items.
- **Time window:** Verifies changing the range updates the query hook arguments and updates the contextual label text.

## scan.test.tsx

**Suite: Venue Scan Page (`/venue/[id]/scan`)**

- **Upload UX:** Verifies front/back upload affordances render on first paint.
- **Scan gating:** Asserts `Scan License` stays disabled until a back-side image is selected, then enables and shows the back preview.

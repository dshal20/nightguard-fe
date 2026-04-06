# Venue Page Test Descriptions

This directory contains the test suites for the Venue-specific pages and components of the NightGuard frontend.

## account.test.tsx
**Suite: Account Page**
- **UI Rendering:** Verifies the "Account" heading, user's full name, role (Venue Member or Admin), and venue location details (Name, City, State) are correctly displayed.
- **Fallback Logic:** Ensures the user's email prefix is used as a fallback if their full name is missing.
- **Authentication:** Validates the "Log out" button's existence and functionality, ensuring it triggers the sign-out process and redirects the user to the login page.

## auth.test.tsx
**Suite: User & Authentication — Profile Display**
- **Sidebar Integration:** Tests that the user's name and role ("Venue Manager") are correctly displayed in the sidebar.
- **Error Handling:** Verifies that the UI gracefully handles API failures by falling back to the user's email prefix.
**Suite: User & Authentication — Sign Out**
- **Log out Flow:** Confirms the "Sign out" button in the sidebar correctly invokes the authentication sign-out method and redirects to `/login`.
- **Support Links:** Ensures the "Need help? Contact Support" text is visible.

## capacity.test.tsx
**Suite: Capacity — Dashboard StatCard**
- **Integration:** Verifies the "CURRENT CAPACITY" card appears on the dashboard with the correct mocked values and "Max Capacity" subtitles.
**Suite: Capacity StatCard — Isolated**
- **Component Logic:** Tests the `StatCard` component in isolation, checking for correct rendering of zero values, max values, and conditional "red" accents for over-capacity scenarios.
**Suite: Capacity Counter (future feature)**
- **Placeholders:** Contains `todo` definitions for future capacity increment/decrement features, limit editing, and reset logic.

## dashboard.test.tsx
**Suite: Dashboard Page**
- **Layout:** Ensures all primary StatCards (Active Incidents, Total Tonight, Current Capacity, Network Alerts) render when a venue is selected.
- **State Management:** Validates loading states and the "Join a Venue" prompt for users with no associated venues.
- **Action Buttons:** Checks for the presence of "New Report" and "Export Event Report" buttons.
**Suite: StatCard Component**
- **Visuals:** Tests general rendering of titles, values, metadata, and different color accents.
**Suite: RecentReports Component**
- **Data Display:** Verifies incident row rendering, empty states, loading spinners, and the "View All Reports" link.
**Suite: LiveActivity Component**
- **Activity Feed:** Checks the rendering of the activity heading, filter buttons, and mock activity items like "Medical Emergency" or "Trespass Issued."

## incidents.test.tsx
**Suite: Incidents Page**
- **Data Fetching:** Validates that incidents are fetched for the currently selected venue using the correct auth token.
- **Table Rendering:** Verifies the incident table displays descriptions, severity levels (MEDIUM/HIGH), and keywords (e.g., "aggressive", "verbal").
- **Empty & Error States:** Tests UI feedback for "No incidents reported yet," network errors, and "No venue found" scenarios.

## navigation.test.tsx
**Suite: Navigation — Sidebar Links**
- **Visibility:** Confirms all navigation sections (Dashboard, Incidents, Offenders, Staff), network links, and settings links are present.
**Suite: Navigation — Active Link Highlighting**
- **Logic:** Verifies that links (Dashboard, Incidents, Account) receive appropriate "active" styling based on the current URL path.
**Suite: Navigation — Badges**
- **Notifications:** Specifically tests that the "Incidents" link displays a notification badge with the correct count.
**Suite: Navigation — Link Destinations**
- **Routing:** Ensures all sidebar links point to the correct internal application paths.

## new-report.test.tsx
**Suite: New Report — Dialog**
- **Form UI:** Tests the opening/closing of the "New Incident Report" dialog.
- **Input Fields:** Validates the Incident Type selector (checking all 11 types), Severity buttons (LOW, MEDIUM, HIGH), and the description textarea.
- **Keyword Management:** Exhaustively tests the keyword system, including adding via button or Enter key, clearing input, preventing duplicates, and removing keywords.
- **Submission Logic:** Verifies form validation (disabling submit until complete), successful API payloads, error message handling, and the final "Success" view.

## offenders.test.tsx
**Suite: Offenders — Sidebar Link**
- **Navigation:** Confirms the "Offenders" link is present in the sidebar.
**Suite: Offenders Page (future feature)**
- **Placeholders:** Contains `todo` definitions for future offender list views, empty states, and detail displays.

## venue-switching.test.tsx
**Suite: Venue Switching — Context (VenueProvider)**
- **State Logic:** Tests the `VenueProvider` logic for auto-selecting the first venue, exposing the full venue list, and handling empty lists.
**Suite: Venue Switching — Sidebar Dropdown**
- **Interaction:** Validates the venue switcher UI, ensuring it displays the current venue's city/state, opens a dropdown list of all available venues on click, and handles loading/empty states.

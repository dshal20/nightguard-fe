# Admin Page Test Descriptions

This directory contains the unit test suites for the Admin Dashboard and its associated components in the NightGuard frontend.

## auth-access.test.tsx
**Suite: Authentication & Access Control**
- **Unauthenticated Redirect**: Verifies that users who are not logged in are redirected to the `/login` page.
- **Unauthorized Redirect**: Ensures that authenticated users without the "ADMIN" role are redirected to the `/venue` dashboard.
- **Authorized Access**: Confirms that users with the "ADMIN" role can access the admin dashboard without being redirected.
- **Loading State**: Validates that a loading spinner is displayed while the authentication state is being determined.

## create-venue-dialog.test.tsx
**Suite: Create Venue Dialog**
- **Trigger Logic**: Tests that both the "New Venue" header button and the empty-state "Create Venue" button correctly open the dialog.
- **Form Validation**: Ensures the "Create Venue" submission button remains disabled until all required fields (Name, Address, City, State, Zip) are populated.
- **Success Flow**: Verifies the end-to-end creation process, including mocking the API response, displaying the generated invite code, and triggering a list refresh upon completion.
- **Copy Functionality**: Tests the "Copy" button within the success screen to ensure it interacts correctly with the clipboard API.
- **Error Handling**: Validates that API failures during venue creation are gracefully displayed as error messages within the dialog.

## dashboard-header.test.tsx
**Suite: Dashboard Header**
- **Identity Display**: Confirms that the header correctly displays the email address of the currently signed-in Firebase user.
- **Sign Out Flow**: Verifies that clicking the "Sign out" button invokes the Firebase sign-out method and redirects the user back to the login page.

## venue-card.test.tsx
**Suite: Venue Card Component**
- **Address Formatting**: Tests the logic that joins address components (Street, City, State, Zip) and ensures empty fields do not result in trailing or double commas.
- **Field Visibility**: Verifies that optional fields like "Phone Number" are hidden when not provided in the venue data.
- **Invite Code Display**: Confirms the invite code is visible and correctly labeled on the card.
- **Copy to Clipboard**: Validates the copy-to-clipboard action on the card, including the temporary "check" icon feedback state.

## venues-listing.test.tsx
**Suite: Venues Listing**
- **Asynchronous Loading**: Ensures a loading spinner is visible while the list of venues is being fetched from the API.
- **Empty State**: Verifies the UI displays a helpful illustration and a call-to-action when the user has no venues.
- **Data Rendering**: Confirms that venue cards are rendered correctly based on API data and that the count badge reflects the total number of venues.
- **Retry Logic**: Tests the error state when an API call fails and verifies that clicking the "Retry" button attempts to fetch the data again.

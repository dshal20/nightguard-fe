# Admin Page Unit Test Requirements

## 1. Authentication & Access Control
* **Unauthenticated Redirect**: Mock `onAuthStateChanged` to return `null`. Verify the page redirects to `/login`.
* **Unauthorized Redirect**: Mock a user profile with `role: "USER"`. Verify the page redirects to `/venue`.
* **Authorized Access**: Mock a user profile with `role: "ADMIN"`. Verify the dashboard content renders without redirecting.
* **Initial Loading**: Ensure the `Loader2` spinner is visible while the auth state is being determined.

## 2. Dashboard Header
* **User Identity**: Verify that the user's email (from Firebase Auth) is correctly displayed in the header.
* **Sign Out**: 
    * Mock `signOut` from Firebase.
    * Click the "Sign out" button.
    * Verify `signOut` is called and the user is redirected to `/login`.

## 3. Venues Listing
* **Loading State**: Ensure a spinner is shown while venues are being fetched from the API.
* **Empty State**: 
    * Mock an empty list response from `getVenues`.
    * Verify the "No venues yet" illustration and "Create Venue" button are displayed.
* **Data Rendering**: 
    * Mock a list of venues.
    * Verify that the correct number of `VenueCard` components are rendered.
    * Verify the venue count badge reflects the number of items in the list.
* **Error Handling**: 
    * Mock a failed `getVenues` API call.
    * Verify an error message is displayed.
    * Click "Retry" and verify that a new API call is attempted.

## 4. Create Venue Dialog
* **Dialog Trigger**: Verify that clicking "New Venue" or the "Create Venue" (from empty state) button opens the `CreateVenueDialog`.
* **Form Validation**: 
    * Verify the "Create Venue" button is disabled by default.
    * Fill in Name, Street Address, City, State, and Postal Code.
    * Verify the button becomes enabled (Phone Number should be optional).
* **Successful Creation**: 
    * Mock a successful `createVenue` API response.
    * Fill the form and submit.
    * Verify the "Venue Created" success screen appears with the correct invite code.
    * Verify clicking "Done" closes the dialog and triggers a refresh of the venue list.
* **Copy Functionality**: 
    * Mock `navigator.clipboard.writeText`.
    * Click the copy button next to the invite code in the success screen.
    * Verify the clipboard API was called with the correct code.
* **Submission Error**: 
    * Mock a failed `createVenue` API call.
    * Verify the error message is displayed within the dialog.

## 5. Venue Card Component
* **Address Formatting**: Verify that the address is correctly joined (e.g., "Street, City, State, Zip") and filters out empty values.
* **Field Visibility**: 
    * Verify the phone number is hidden if not provided in the venue object.
    * Verify the invite code is visible and correctly formatted.
* **Copy Invite Code**: 
    * Click the copy button on a specific card.
    * Verify `navigator.clipboard.writeText` is called.
    * Verify the icon changes to a checkmark briefly (may require `jest.useFakeTimers`).

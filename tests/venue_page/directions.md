1. You will be using Jest to facilitate unit tests
2. Clicking on the *dashboard* button on the left of the screen should have the ACTIVE INCIDENTS, TOTAL TONIGHT, CURRENT CAPACITY, NETWORK ALERTS, and other components appear.
3. Clicking *incidents* should either diplay a list of incidents or No incidents reported yet. make a test w/ no incidnets, and a test with one or two mocked incidents.
4. Clicking *capacity* should dislpay a counter component. check to ensure that the plus and minus buttons also work, as well as log count. Ensure you can click edit limit and type into the box that follows and save that capacity to go back to the previous screen within varying tests. ensure reset count works. make sure the components turn red when you excede an arbitrary limit that is mocked.
3. Clicking *offenders* should either diplay a list of offenders or No offenders reported yet. make a test w/ no offenders, and a test with one or two mocked offenders.
5. Clicking *account* should lead you with only an account component, the name within the component and the bottom left sign out component should match.
6. Clicking on the bottom left user button should have a signout option pop up. Clicking the signout should take you off the dashboard.
7. Clicking *New Report* should have a incident report component pop up. Make test cases for all parts of the form as well.


 1. Venue Switching (Critical)
   * Dropdown Logic: Test that the venue dropdown in the sidebar correctly lists all venues the user belongs to.
   * State Persistence: Verify that selecting a new venue updates the dashboard stats and the incident list for that specific venue.
   * Default Selection: Ensure the first available venue is automatically selected when the user logs in.
   
5. Navigation Integrity
   * Active Links: Ensure the sidebar correctly highlights the "Dashboard" or "Incidents" link based on the current URL.
   * Badges: Test that the notification badges (e.g., the "3" next to Incidents) are rendered when expected.

3. User & Authentication
   * Profile Display: Test that the sidebar correctly displays the user's name (fetched via getMe) or falls back to their email prefix.
   * Sign Out: Verify that the "Sign out" button cleared the session and redirects to the login page.
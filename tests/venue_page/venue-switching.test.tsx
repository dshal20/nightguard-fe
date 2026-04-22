import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VenueProvider, useVenueContext } from "@/app/venue/context/VenueContext";
import VenueSidebar from "@/app/venue/components/VenueSidebar";
import { mockVenues } from "./helpers";

jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: { uid: "uid-1", email: "john@example.com", getIdToken: jest.fn().mockResolvedValue("t") } },
}));
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_a: unknown, cb: (u: unknown) => void) => { cb({ uid: "uid-1", email: "john@example.com", getIdToken: jest.fn().mockResolvedValue("t") }); return jest.fn(); }),
  signOut: jest.fn(), getAuth: jest.fn(),
}));
jest.mock("@/lib/api", () => ({
  getMe: jest.fn().mockResolvedValue({ id: "u1", firstName: "John", lastName: "Doe", email: "john@example.com", phoneNumber: null, role: "USER" }),
}));
const mockPush = jest.fn();
let mockPathname = "/venue/v1";
let mockParams: { id?: string } = {};
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => mockPathname,
  useParams: () => mockParams,
}));

function ContextInspector() {
  const { venues, selectedVenue } = useVenueContext();
  return (
    <div>
      <span data-testid="venue-count">{venues.length}</span>
      <span data-testid="selected-name">{selectedVenue?.name ?? "none"}</span>
    </div>
  );
}

describe("Venue Switching — Context (VenueProvider)", () => {
  it("auto-selects the first venue on initial load", () => {
    mockParams = {};
    render(<VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}><ContextInspector /></VenueProvider>);
    expect(screen.getByTestId("selected-name")).toHaveTextContent("NightGuard Downtown");
  });

  it("exposes all venues through context", () => {
    mockParams = {};
    render(<VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}><ContextInspector /></VenueProvider>);
    expect(screen.getByTestId("venue-count")).toHaveTextContent("2");
  });

  it("selects none when venues list is empty", () => {
    mockParams = {};
    render(<VenueProvider venues={[]} loading={false} refetch={jest.fn()}><ContextInspector /></VenueProvider>);
    expect(screen.getByTestId("selected-name")).toHaveTextContent("none");
  });
});

describe("Venue Switching — Sidebar Dropdown", () => {
  it("displays the currently selected venue name", () => {
    render(<VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}><VenueSidebar /></VenueProvider>);
    expect(screen.getByText("NightGuard Downtown")).toBeInTheDocument();
  });

  it("displays venue city and state under the name", () => {
    render(<VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}><VenueSidebar /></VenueProvider>);
    expect(screen.getByText("Gainesville, FL")).toBeInTheDocument();
  });

  it("opens the dropdown and shows all venues when clicked", async () => {
    const user = userEvent.setup();
    render(<VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}><VenueSidebar /></VenueProvider>);
    const trigger = screen.getByText("NightGuard Downtown").closest("button")!;
    await user.click(trigger);
    await waitFor(() => { expect(screen.getByText("NightGuard Midtown")).toBeInTheDocument(); });
  });

  it('shows "No venues" when venue list is empty', () => {
    render(<VenueProvider venues={[]} loading={false} refetch={jest.fn()}><VenueSidebar /></VenueProvider>);
    expect(screen.getByText("No venues")).toBeInTheDocument();
  });

  it('shows "Loading…" when venues are loading', () => {
    render(<VenueProvider venues={[]} loading={true} refetch={jest.fn()}><VenueSidebar /></VenueProvider>);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

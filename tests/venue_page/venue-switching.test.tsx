import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { VenueProvider, useVenueContext } from "@/app/venue/context/VenueContext";
import VenueSidebar from "@/app/venue/components/VenueSidebar";
import { mockVenues } from "./helpers";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

jest.mock("@/app/src/lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "firebase-uid-1",
      email: "john.doe@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    },
  },
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((_auth: unknown, cb: (u: unknown) => void) => {
    cb({
      uid: "firebase-uid-1",
      email: "john.doe@example.com",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    });
    return jest.fn();
  }),
  signOut: jest.fn(),
  getAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  getMe: jest.fn().mockResolvedValue({
    id: "user-1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "352-555-1234",
    role: "USER",
  }),
  getVenues: jest.fn().mockResolvedValue([
    {
      id: "venue-1",
      name: "NightGuard Downtown",
      streetAddress: "123 Main St",
      city: "Gainesville",
      state: "FL",
      postalCode: "32601",
      phoneNumber: "352-555-0001",
      inviteCode: "NG1234",
    },
    {
      id: "venue-2",
      name: "NightGuard Midtown",
      streetAddress: "456 Oak Ave",
      city: "Orlando",
      state: "FL",
      postalCode: "32801",
      phoneNumber: "407-555-0002",
      inviteCode: "NG5678",
    },
  ]),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => "/venue",
}));

/* ------------------------------------------------------------------ */
/*  Tests: VenueProvider (context logic)                               */
/* ------------------------------------------------------------------ */

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
    render(
      <VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}>
        <ContextInspector />
      </VenueProvider>,
    );

    expect(screen.getByTestId("selected-name")).toHaveTextContent(
      "NightGuard Downtown",
    );
  });

  it("exposes all venues through context", () => {
    render(
      <VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}>
        <ContextInspector />
      </VenueProvider>,
    );

    expect(screen.getByTestId("venue-count")).toHaveTextContent("2");
  });

  it("selects none when venues list is empty", () => {
    render(
      <VenueProvider venues={[]} loading={false} refetch={jest.fn()}>
        <ContextInspector />
      </VenueProvider>,
    );

    expect(screen.getByTestId("selected-name")).toHaveTextContent("none");
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Venue Dropdown in Sidebar                                   */
/* ------------------------------------------------------------------ */

describe("Venue Switching — Sidebar Dropdown", () => {
  it("displays the currently selected venue name", () => {
    render(
      <VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}>
        <VenueSidebar />
      </VenueProvider>,
    );

    expect(screen.getByText("NightGuard Downtown")).toBeInTheDocument();
  });

  it("displays venue city and state under the name", () => {
    render(
      <VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}>
        <VenueSidebar />
      </VenueProvider>,
    );

    expect(screen.getByText("Gainesville, FL")).toBeInTheDocument();
  });

  it("opens the dropdown and shows all venues when clicked", async () => {
    const user = userEvent.setup();

    render(
      <VenueProvider venues={mockVenues} loading={false} refetch={jest.fn()}>
        <VenueSidebar />
      </VenueProvider>,
    );

    const trigger = screen.getByText("NightGuard Downtown").closest("button")!;
    await user.click(trigger);

    await waitFor(() => {
      expect(screen.getByText("NightGuard Midtown")).toBeInTheDocument();
    });
  });

  it('shows "No venues" when venue list is empty', () => {
    render(
      <VenueProvider venues={[]} loading={false} refetch={jest.fn()}>
        <VenueSidebar />
      </VenueProvider>,
    );

    expect(screen.getByText("No venues")).toBeInTheDocument();
  });

  it('shows "Loading…" when venues are loading', () => {
    render(
      <VenueProvider venues={[]} loading={true} refetch={jest.fn()}>
        <VenueSidebar />
      </VenueProvider>,
    );

    expect(screen.getByText("Loading…")).toBeInTheDocument();
  });
});

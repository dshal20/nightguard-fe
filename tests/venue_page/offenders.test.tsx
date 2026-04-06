import { render, screen } from "@testing-library/react";
import VenueSidebar from "@/app/venue/components/VenueSidebar";
/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => ({
    venues: [
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
    ],
    selectedVenue: {
      id: "venue-1",
      name: "NightGuard Downtown",
      streetAddress: "123 Main St",
      city: "Gainesville",
      state: "FL",
      postalCode: "32601",
      phoneNumber: "352-555-0001",
      inviteCode: "NG1234",
    },
    setSelectedVenue: jest.fn(),
    loading: false,
    refetch: jest.fn(),
  }),
}));

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
/*  Tests: Offenders Link Exists in Sidebar                            */
/* ------------------------------------------------------------------ */

describe("Offenders — Sidebar Link", () => {
  it('renders an "Offenders" navigation item in the sidebar', () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Offenders")).toBeInTheDocument();
  });

  it("the Offenders link is present as a link element", () => {
    render(<VenueSidebar />);
    const link = screen.getByText("Offenders").closest("a");
    expect(link).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Placeholder tests for future Offenders page                        */
/* ------------------------------------------------------------------ */

describe("Offenders Page (future feature)", () => {
  it.todo('should display "No offenders reported yet." when the list is empty');
  it.todo("should display a list of offenders when offenders exist");
  it.todo("should show offender name and details for each entry");
  it.todo("should show the venue associated with each offender");
});

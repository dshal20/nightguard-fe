import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VenueSidebar from "@/app/venue/components/VenueSidebar";
import { mockFirebaseUser, mockUser, mockUserNoName } from "./helpers";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockPush = jest.fn();

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

const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  getAuth: jest.fn(),
}));

const mockGetMe = jest.fn();

jest.mock("@/lib/api", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/venue",
}));

/* ------------------------------------------------------------------ */
/*  Tests: Profile Display                                             */
/* ------------------------------------------------------------------ */

describe("User & Authentication — Profile Display", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: unknown) => void) => {
        cb(mockFirebaseUser);
        return jest.fn();
      },
    );
  });

  it("displays the user's full name from getMe", async () => {
    mockGetMe.mockResolvedValue(mockUser);

    render(<VenueSidebar />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("falls back to email prefix when getMe returns no name", async () => {
    mockGetMe.mockResolvedValue(mockUserNoName);

    render(<VenueSidebar />);

    await waitFor(() => {
      expect(screen.getByText("john.doe")).toBeInTheDocument();
    });
  });

  it("falls back to email prefix when getMe fails", async () => {
    mockGetMe.mockRejectedValue(new Error("API error"));

    render(<VenueSidebar />);

    await waitFor(() => {
      expect(screen.getByText("john.doe")).toBeInTheDocument();
    });
  });

  it('displays "Venue Manager" role label', async () => {
    mockGetMe.mockResolvedValue(mockUser);

    render(<VenueSidebar />);
    expect(screen.getByText("Venue Manager")).toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Sign Out                                                    */
/* ------------------------------------------------------------------ */

describe("User & Authentication — Sign Out", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation(
      (_auth: unknown, cb: (u: unknown) => void) => {
        cb(mockFirebaseUser);
        return jest.fn();
      },
    );
    mockGetMe.mockResolvedValue(mockUser);
  });

  it('renders a "Sign out" button in the sidebar', () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("calls signOut and redirects to /login when Sign out is clicked", async () => {
    const user = userEvent.setup();

    render(<VenueSidebar />);

    const signOutBtn = screen.getByText("Sign out");
    await user.click(signOutBtn);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it('renders a "Need help? Contact Support" text', () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Need help? Contact Support")).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VenueAccountPage from "@/app/venue/account/page";
import { mockVenues, mockUser, mockUserNoName } from "./helpers";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockGetMe = jest.fn();
const mockGetVenues = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockPush = jest.fn();

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
  signOut: (...args: unknown[]) => mockSignOut(...args),
  getAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  getVenues: (...args: unknown[]) => mockGetVenues(...args),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
  usePathname: () => "/venue/account",
}));

/* ------------------------------------------------------------------ */
/*  Tests                                                              */
/* ------------------------------------------------------------------ */

describe("Account Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMe.mockResolvedValue(mockUser);
    mockGetVenues.mockResolvedValue(mockVenues);
  });

  it("renders the Account heading", async () => {
    render(<VenueAccountPage />);
    expect(screen.getByText("Account")).toBeInTheDocument();
  });

  it("displays the user's full name", async () => {
    render(<VenueAccountPage />);

    await waitFor(() => {
      expect(screen.getByText("John Doe")).toBeInTheDocument();
    });
  });

  it("displays the user's role", async () => {
    render(<VenueAccountPage />);

    await waitFor(() => {
      expect(screen.getByText("Venue Member")).toBeInTheDocument();
    });
  });

  it("displays the venue name", async () => {
    render(<VenueAccountPage />);

    await waitFor(() => {
      expect(screen.getByText("NightGuard Downtown")).toBeInTheDocument();
    });
  });

  it("displays venue city and state", async () => {
    render(<VenueAccountPage />);

    await waitFor(() => {
      expect(screen.getByText("Gainesville, FL")).toBeInTheDocument();
    });
  });

  it("falls back to email prefix when user has no name", async () => {
    mockGetMe.mockResolvedValue(mockUserNoName);

    render(<VenueAccountPage />);

    await waitFor(() => {
      expect(screen.getByText("john.doe")).toBeInTheDocument();
    });
  });

  it("displays ADMIN role when user is admin", async () => {
    mockGetMe.mockResolvedValue({ ...mockUser, role: "ADMIN" });

    render(<VenueAccountPage />);

    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
  });

  it("renders a Log out button", async () => {
    render(<VenueAccountPage />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("signs out and redirects to /login when Log out is clicked", async () => {
    const user = userEvent.setup();

    render(<VenueAccountPage />);

    const logoutButton = screen.getByText("Log out");
    await user.click(logoutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});

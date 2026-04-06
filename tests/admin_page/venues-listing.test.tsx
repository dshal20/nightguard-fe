import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "@/app/admin/page";
import { adminProfile, buildMockAuthUser, mockVenues } from "./helpers";

const mockPush = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockGetMe = jest.fn();
const mockGetVenues = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signOut: jest.fn(),
}));

jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: null },
}));

jest.mock("@/lib/api", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  getVenues: (...args: unknown[]) => mockGetVenues(...args),
}));

describe("Venues Listing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const authUser = buildMockAuthUser();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(authUser);
      return jest.fn();
    });
    mockGetMe.mockResolvedValue(adminProfile);
  });

  it("shows spinner while venues are being fetched", async () => {
    mockGetVenues.mockImplementation(
      () => new Promise(() => {}),
    );

    const { container } = render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Your Venues")).toBeInTheDocument();
    });
    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });

  it('shows empty state with "No venues yet" and "Create Venue"', async () => {
    mockGetVenues.mockResolvedValue([]);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("No venues yet")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Create Venue" })).toBeInTheDocument();
    });
  });

  it("renders venue cards and count badge from API data", async () => {
    mockGetVenues.mockResolvedValue(mockVenues);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("NightGuard Downtown")).toBeInTheDocument();
      expect(screen.getByText("NightGuard Midtown")).toBeInTheDocument();
      expect(screen.getByText("2")).toBeInTheDocument();
    });
  });

  it("shows error and retries fetching when Retry is clicked", async () => {
    const user = userEvent.setup();
    mockGetVenues.mockRejectedValueOnce(new Error("boom")).mockResolvedValueOnce(mockVenues);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Failed to load venues. Please try again."),
      ).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(mockGetVenues).toHaveBeenCalledTimes(2);
      expect(screen.getByText("NightGuard Downtown")).toBeInTheDocument();
    });
  });
});

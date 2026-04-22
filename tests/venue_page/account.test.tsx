import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VenueAccountPage from "@/app/venue/[id]/account/page";
import { mockVenues, mockUser, mockUserNoName } from "./helpers";

const mockGetMe = jest.fn();
const mockGetVenues = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockPush = jest.fn();

jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: { uid: "uid-1", email: "john.doe@example.com", getIdToken: jest.fn().mockResolvedValue("mock-token") } },
}));
jest.mock("firebase/auth", () => ({ signOut: (...args: unknown[]) => mockSignOut(...args), getAuth: jest.fn() }));
jest.mock("@/lib/api", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  getVenues: (...args: unknown[]) => mockGetVenues(...args),
}));
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/venue/venue-1/account",
  useParams: () => ({ id: "venue-1" }),
}));

describe("Account Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetMe.mockResolvedValue(mockUser);
    mockGetVenues.mockResolvedValue(mockVenues);
  });

  it("renders account page shell", async () => {
    render(<VenueAccountPage />);
    await waitFor(() => { expect(screen.getByText("Account")).toBeInTheDocument(); });
  });

  it("displays the user's role", async () => {
    render(<VenueAccountPage />);
    await waitFor(() => { expect(screen.getByDisplayValue("Venue Member")).toBeInTheDocument(); });
  });

  it("displays the venue name", async () => {
    render(<VenueAccountPage />);
    await waitFor(() => { expect(screen.getByDisplayValue("NightGuard Downtown")).toBeInTheDocument(); });
  });

  it("falls back to first initial when user has no name", async () => {
    mockGetMe.mockResolvedValue(mockUserNoName);
    render(<VenueAccountPage />);
    await waitFor(() => { expect(screen.getByText("J")).toBeInTheDocument(); });
  });

  it("displays ADMIN role when user is admin", async () => {
    mockGetMe.mockResolvedValue({ ...mockUser, role: "ADMIN" });
    render(<VenueAccountPage />);
    await waitFor(() => { expect(screen.getByDisplayValue("Admin")).toBeInTheDocument(); });
  });

  it("renders a Log out button", () => {
    render(<VenueAccountPage />);
    expect(screen.getByText("Log out")).toBeInTheDocument();
  });

  it("signs out and redirects to /login when Log out is clicked", async () => {
    const user = userEvent.setup();
    render(<VenueAccountPage />);
    await user.click(screen.getByText("Log out"));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});

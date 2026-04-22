import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import VenueSidebar from "@/app/venue/components/VenueSidebar";
import { mockUser, mockUserNoName } from "./helpers";

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => ({
    venues: [{ id: "v1", name: "NightGuard Downtown", streetAddress: "123 Main", city: "Gainesville", state: "FL", postalCode: "32601", phoneNumber: "555-0001", inviteCode: "NG1234" }],
    selectedVenue: { id: "v1", name: "NightGuard Downtown", streetAddress: "123 Main", city: "Gainesville", state: "FL", postalCode: "32601", phoneNumber: "555-0001", inviteCode: "NG1234" },
    setSelectedVenue: jest.fn(), loading: false, refetch: jest.fn(),
  }),
}));
jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: { uid: "uid-1", email: "john.doe@example.com", getIdToken: jest.fn().mockResolvedValue("t") } },
}));

const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
  getAuth: jest.fn(),
}));

const mockGetMe = jest.fn();
jest.mock("@/lib/api", () => ({ getMe: (...args: unknown[]) => mockGetMe(...args) }));

const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, replace: jest.fn() }),
  usePathname: () => "/venue/v1",
  useParams: () => ({ id: "v1" }),
}));

describe("User & Authentication — Profile Display", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_a: unknown, cb: (u: unknown) => void) => {
      cb({ uid: "uid-1", email: "john.doe@example.com", getIdToken: jest.fn().mockResolvedValue("t") });
      return jest.fn();
    });
  });

  it("displays the user's full name from getMe", async () => {
    mockGetMe.mockResolvedValue(mockUser);
    render(<VenueSidebar />);
    await waitFor(() => { expect(screen.getByText("John Doe")).toBeInTheDocument(); });
  });

  it("falls back to email prefix when getMe returns no name", async () => {
    mockGetMe.mockResolvedValue(mockUserNoName);
    render(<VenueSidebar />);
    await waitFor(() => { expect(screen.getByText("john.doe")).toBeInTheDocument(); });
  });

  it("falls back to email prefix when getMe fails", async () => {
    mockGetMe.mockRejectedValue(new Error("API error"));
    render(<VenueSidebar />);
    await waitFor(() => { expect(screen.getByText("john.doe")).toBeInTheDocument(); });
  });

  it('displays "Venue Member" role label', async () => {
    mockGetMe.mockResolvedValue(mockUser);
    render(<VenueSidebar />);
    await waitFor(() => { expect(screen.getByText("Venue Member")).toBeInTheDocument(); });
  });
});

describe("User & Authentication — Sign Out", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockOnAuthStateChanged.mockImplementation((_a: unknown, cb: (u: unknown) => void) => {
      cb({ uid: "uid-1", email: "john.doe@example.com", getIdToken: jest.fn().mockResolvedValue("t") });
      return jest.fn();
    });
    mockGetMe.mockResolvedValue(mockUser);
  });

  it("renders a sign out option in the user dropdown", async () => {
    const user = userEvent.setup();
    render(<VenueSidebar />);
    await waitFor(() => { expect(screen.getByText("Venue Member")).toBeInTheDocument(); });
    const userButton = screen.getByText("Venue Member").closest("button")!;
    await user.click(userButton);
    await waitFor(() => { expect(screen.getByText("Sign out")).toBeInTheDocument(); });
  });

  it("calls signOut and redirects to /login when Sign out is clicked", async () => {
    const user = userEvent.setup();
    render(<VenueSidebar />);
    await waitFor(() => { expect(screen.getByText("Venue Member")).toBeInTheDocument(); });
    const userButton = screen.getByText("Venue Member").closest("button")!;
    await user.click(userButton);
    await waitFor(() => { expect(screen.getByText("Sign out")).toBeInTheDocument(); });
    await user.click(screen.getByText("Sign out"));
    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});

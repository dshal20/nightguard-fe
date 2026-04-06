import { render, screen, waitFor } from "@testing-library/react";
import AdminDashboard from "@/app/admin/page";
import { adminProfile, buildMockAuthUser, userProfile } from "./helpers";

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

describe("Authentication & Access Control", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetVenues.mockResolvedValue([]);
  });

  it("redirects unauthenticated users to /login", async () => {
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(null);
      return jest.fn();
    });

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("redirects authenticated non-admin users to /venue", async () => {
    const authUser = buildMockAuthUser("member@nightguard.test");
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(authUser);
      return jest.fn();
    });
    mockGetMe.mockResolvedValue(userProfile);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/venue");
    });
  });

  it("renders dashboard content for ADMIN users without redirect", async () => {
    const authUser = buildMockAuthUser();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(authUser);
      return jest.fn();
    });
    mockGetMe.mockResolvedValue(adminProfile);
    mockGetVenues.mockResolvedValue([]);

    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("Admin Dashboard")).toBeInTheDocument();
    });
    expect(mockPush).not.toHaveBeenCalledWith("/login");
    expect(mockPush).not.toHaveBeenCalledWith("/venue");
  });

  it("shows loading spinner while auth state is pending", () => {
    mockOnAuthStateChanged.mockImplementation(() => jest.fn());

    const { container } = render(<AdminDashboard />);

    expect(container.querySelector("svg.animate-spin")).toBeInTheDocument();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "@/app/admin/page";
import { adminProfile, buildMockAuthUser } from "./helpers";

const mockPush = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockSignOut = jest.fn().mockResolvedValue(undefined);
const mockGetMe = jest.fn();
const mockGetVenues = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signOut: (...args: unknown[]) => mockSignOut(...args),
}));

jest.mock("@/app/src/lib/firebase", () => ({
  auth: { currentUser: null },
}));

jest.mock("@/lib/api", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  getVenues: (...args: unknown[]) => mockGetVenues(...args),
}));

describe("Dashboard Header", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const authUser = buildMockAuthUser("admin@nightguard.test");
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(authUser);
      return jest.fn();
    });
    mockGetMe.mockResolvedValue(adminProfile);
    mockGetVenues.mockResolvedValue([]);
  });

  it("displays signed-in user email in the header", async () => {
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByText("admin@nightguard.test")).toBeInTheDocument();
    });
  });

  it("signs out and redirects to /login", async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Sign out" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Sign out" }));

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });
});

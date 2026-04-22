import { render, screen } from "@testing-library/react";
import VenueSidebar from "@/app/venue/components/VenueSidebar";

jest.mock("@/app/venue/context/VenueContext", () => ({
  useVenueContext: () => ({
    venues: [{ id: "v1", name: "NightGuard Downtown", streetAddress: "123 Main", city: "Gainesville", state: "FL", postalCode: "32601", phoneNumber: "555-0001", inviteCode: "NG1234" }],
    selectedVenue: { id: "v1", name: "NightGuard Downtown", streetAddress: "123 Main", city: "Gainesville", state: "FL", postalCode: "32601", phoneNumber: "555-0001", inviteCode: "NG1234" },
    setSelectedVenue: jest.fn(), loading: false, refetch: jest.fn(),
  }),
}));
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
jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  usePathname: () => "/venue/v1",
  useParams: () => ({ id: "v1" }),
}));

describe("Offenders — Sidebar Link", () => {
  it('renders an "Offenders" navigation item', () => {
    render(<VenueSidebar />);
    expect(screen.getByText("Offenders")).toBeInTheDocument();
  });

  it("the Offenders link points to /venue/v1/offenders", () => {
    render(<VenueSidebar />);
    const link = screen.getByText("Offenders").closest("a");
    expect(link).toHaveAttribute("href", "/venue/v1/offenders");
  });
});

describe("Offenders Page (future feature)", () => {
  it.todo('should display "No offenders reported yet." when the list is empty');
  it.todo("should display a list of offenders when offenders exist");
  it.todo("should show offender name and details for each entry");
  it.todo("should show the venue associated with each offender");
});

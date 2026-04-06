import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AdminDashboard from "@/app/admin/page";
import CreateVenueDialog from "@/app/admin/components/CreateVenueDialog";
import { adminProfile, buildMockAuthUser } from "./helpers";

const mockPush = jest.fn();
const mockOnAuthStateChanged = jest.fn();
const mockGetMe = jest.fn();
const mockGetVenues = jest.fn();
const mockCreateVenue = jest.fn();
let writeTextMock: jest.Mock;
let writeTextSpy: jest.SpyInstance | null = null;

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: unknown[]) => mockOnAuthStateChanged(...args),
  signOut: jest.fn(),
}));

jest.mock("@/app/src/lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "uid-1",
      email: "admin@nightguard.test",
      getIdToken: jest.fn().mockResolvedValue("mock-token"),
    },
  },
}));

jest.mock("@/lib/api", () => ({
  getMe: (...args: unknown[]) => mockGetMe(...args),
  getVenues: (...args: unknown[]) => mockGetVenues(...args),
  createVenue: (...args: unknown[]) => mockCreateVenue(...args),
}));

async function fillVenueForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByPlaceholderText("e.g. The Blue Lounge"), "Blue Lounge");
  await user.type(screen.getByPlaceholderText("123 Main St"), "101 Main St");
  await user.type(screen.getByPlaceholderText("Gainesville"), "Gainesville");
  await user.selectOptions(screen.getByRole("combobox"), "FL");
  await user.type(screen.getByPlaceholderText("32601"), "32601");
}

describe("Create Venue Dialog", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    writeTextMock = jest.fn();
    writeTextSpy = null;
    if (window.navigator.clipboard && typeof window.navigator.clipboard.writeText === "function") {
      writeTextSpy = jest
        .spyOn(window.navigator.clipboard, "writeText")
        .mockImplementation(writeTextMock);
    } else {
      Object.defineProperty(window.navigator, "clipboard", {
        value: { writeText: writeTextMock },
        configurable: true,
      });
    }
    mockGetMe.mockResolvedValue(adminProfile);
    mockGetVenues.mockResolvedValue([]);
    const authUser = buildMockAuthUser();
    mockOnAuthStateChanged.mockImplementation((_auth: unknown, cb: (u: unknown) => void) => {
      cb(authUser);
      return jest.fn();
    });
  });

  afterEach(() => {
    writeTextSpy?.mockRestore();
  });

  it('opens dialog when "New Venue" is clicked', async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "New Venue" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "New Venue" }));

    expect(screen.getByText("Create New Venue")).toBeInTheDocument();
  });

  it('opens dialog from empty-state "Create Venue" button', async () => {
    const user = userEvent.setup();
    render(<AdminDashboard />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "Create Venue" })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Create Venue" }));

    expect(screen.getByText("Create New Venue")).toBeInTheDocument();
  });

  it("keeps submit disabled until required fields are completed", async () => {
    const user = userEvent.setup();
    render(<CreateVenueDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);

    const submit = screen.getByRole("button", { name: "Create Venue" });
    expect(submit).toBeDisabled();

    await fillVenueForm(user);

    expect(submit).not.toBeDisabled();
  });

  it("shows success state with invite code and refreshes list on Done", async () => {
    const user = userEvent.setup();
    const onOpenChange = jest.fn();
    const onCreated = jest.fn();
    mockCreateVenue.mockResolvedValue({
      id: "venue-99",
      name: "Blue Lounge",
      streetAddress: "101 Main St",
      city: "Gainesville",
      state: "FL",
      postalCode: "32601",
      phoneNumber: "",
      inviteCode: "INV-9000",
    });

    render(<CreateVenueDialog open onOpenChange={onOpenChange} onCreated={onCreated} />);

    await fillVenueForm(user);
    await user.click(screen.getByRole("button", { name: "Create Venue" }));

    await waitFor(() => {
      expect(screen.getByText("Venue Created")).toBeInTheDocument();
      expect(screen.getByText("INV-9000")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Done" }));

    expect(onCreated).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("copies invite code from success screen", async () => {
    const user = userEvent.setup();
    mockCreateVenue.mockResolvedValue({
      id: "venue-99",
      name: "Blue Lounge",
      streetAddress: "101 Main St",
      city: "Gainesville",
      state: "FL",
      postalCode: "32601",
      phoneNumber: "",
      inviteCode: "INV-COPY",
    });

    render(<CreateVenueDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);
    await fillVenueForm(user);
    await user.click(screen.getByRole("button", { name: "Create Venue" }));

    await waitFor(() => {
      expect(screen.getByText("INV-COPY")).toBeInTheDocument();
    });

    const codeContainer = screen.getByText("INV-COPY").parentElement;
    const copyButton = codeContainer?.querySelector("button");
    expect(copyButton).toBeInTheDocument();
    await user.click(copyButton as HTMLButtonElement);

    expect(writeTextMock).toHaveBeenCalledWith("INV-COPY");
  });

  it("shows an error when createVenue fails", async () => {
    const user = userEvent.setup();
    mockCreateVenue.mockRejectedValue(new Error("Failed to create venue"));

    render(<CreateVenueDialog open onOpenChange={jest.fn()} onCreated={jest.fn()} />);

    await fillVenueForm(user);
    await user.click(screen.getByRole("button", { name: "Create Venue" }));

    await waitFor(() => {
      expect(screen.getByText("Failed to create venue")).toBeInTheDocument();
    });
  });
});

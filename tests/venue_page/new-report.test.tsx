import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import IncidentReportDialog from "@/app/venue/components/IncidentReportDialog";

/* ------------------------------------------------------------------ */
/*  Mocks                                                              */
/* ------------------------------------------------------------------ */

const mockCreateIncident = jest.fn();

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
  getAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  createIncident: (...args: unknown[]) => mockCreateIncident(...args),
}));

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function renderDialog(open = true) {
  const onOpenChange = jest.fn();
  const result = render(
    <IncidentReportDialog
      open={open}
      onOpenChange={onOpenChange}
      venueId="venue-1"
    />,
  );
  return { ...result, onOpenChange };
}

/* ------------------------------------------------------------------ */
/*  Tests: Dialog Open / Close                                         */
/* ------------------------------------------------------------------ */

describe("New Report — Dialog Open/Close", () => {
  it("renders the dialog with the title when open", () => {
    renderDialog(true);
    expect(screen.getByText("New Incident Report")).toBeInTheDocument();
  });

  it("does not render dialog content when closed", () => {
    renderDialog(false);
    expect(screen.queryByText("New Incident Report")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Incident Type Selection                                     */
/* ------------------------------------------------------------------ */

describe("New Report — Incident Type", () => {
  it("renders the Incident Type select field", () => {
    renderDialog();
    expect(screen.getByText("Incident Type")).toBeInTheDocument();
  });

  it("has a placeholder option that says Select type...", () => {
    renderDialog();
    expect(screen.getByText("Select type...")).toBeInTheDocument();
  });

  it("lists all 11 incident types in the dropdown", () => {
    renderDialog();
    const select = screen.getByRole("combobox");
    const options = within(select as HTMLSelectElement).getAllByRole("option");
    // 11 types + 1 placeholder
    expect(options.length).toBe(12);
  });

  it("can select an incident type", async () => {
    const user = userEvent.setup();
    renderDialog();

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "VERBAL_HARASSMENT");

    expect((select as HTMLSelectElement).value).toBe("VERBAL_HARASSMENT");
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Severity Selection                                          */
/* ------------------------------------------------------------------ */

describe("New Report — Severity", () => {
  it("renders the Severity label", () => {
    renderDialog();
    expect(screen.getByText("Severity")).toBeInTheDocument();
  });

  it("renders LOW, MEDIUM, and HIGH buttons", () => {
    renderDialog();
    expect(screen.getByText("LOW")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("HIGH")).toBeInTheDocument();
  });

  it("allows selecting a severity level", async () => {
    const user = userEvent.setup();
    renderDialog();

    const highBtn = screen.getByText("HIGH");
    await user.click(highBtn);

    expect(highBtn.className).toContain("text-[#E84868]");
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Description                                                 */
/* ------------------------------------------------------------------ */

describe("New Report — Description", () => {
  it("renders the Description label and textarea", () => {
    renderDialog();
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Describe what happened..."),
    ).toBeInTheDocument();
  });

  it("allows typing a description", async () => {
    const user = userEvent.setup();
    renderDialog();

    const textarea = screen.getByPlaceholderText("Describe what happened...");
    await user.type(textarea, "A fight broke out near the entrance");

    expect(textarea).toHaveValue("A fight broke out near the entrance");
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Keywords                                                    */
/* ------------------------------------------------------------------ */

describe("New Report — Keywords", () => {
  it("renders the Keywords label and input", () => {
    renderDialog();
    expect(screen.getByText("Keywords")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Type a keyword and press Enter"),
    ).toBeInTheDocument();
  });

  it("renders an Add button for keywords", () => {
    renderDialog();
    expect(screen.getByText("Add")).toBeInTheDocument();
  });

  it("adds a keyword when Add button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    const input = screen.getByPlaceholderText(
      "Type a keyword and press Enter",
    );
    await user.type(input, "fight");
    await user.click(screen.getByText("Add"));

    expect(screen.getByText("fight")).toBeInTheDocument();
  });

  it("adds a keyword when Enter is pressed", async () => {
    const user = userEvent.setup();
    renderDialog();

    const input = screen.getByPlaceholderText(
      "Type a keyword and press Enter",
    );
    await user.type(input, "aggressive{Enter}");

    expect(screen.getByText("aggressive")).toBeInTheDocument();
  });

  it("clears the keyword input after adding", async () => {
    const user = userEvent.setup();
    renderDialog();

    const input = screen.getByPlaceholderText(
      "Type a keyword and press Enter",
    );
    await user.type(input, "theft{Enter}");

    expect(input).toHaveValue("");
  });

  it("does not add duplicate keywords", async () => {
    const user = userEvent.setup();
    renderDialog();

    const input = screen.getByPlaceholderText(
      "Type a keyword and press Enter",
    );
    await user.type(input, "fight{Enter}");
    await user.type(input, "fight{Enter}");

    const badges = screen.getAllByText("fight");
    expect(badges).toHaveLength(1);
  });

  it("removes a keyword when its X button is clicked", async () => {
    const user = userEvent.setup();
    renderDialog();

    const input = screen.getByPlaceholderText(
      "Type a keyword and press Enter",
    );
    await user.type(input, "fight{Enter}");

    expect(screen.getByText("fight")).toBeInTheDocument();

    const keywordSpan = screen.getByText("fight").closest("span")!;
    const removeBtn = within(keywordSpan).getByRole("button");
    await user.click(removeBtn);

    expect(screen.queryByText("fight")).not.toBeInTheDocument();
  });
});

/* ------------------------------------------------------------------ */
/*  Tests: Form Validation & Submit                                    */
/* ------------------------------------------------------------------ */

describe("New Report — Submission", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("submit button is disabled when form is incomplete", () => {
    renderDialog();
    const submitBtn = screen.getByText("Submit Report");
    expect(submitBtn).toBeDisabled();
  });

  it("submit button is enabled when form is complete", async () => {
    const user = userEvent.setup();
    renderDialog();

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "THEFT");
    await user.click(screen.getByText("HIGH"));

    const textarea = screen.getByPlaceholderText("Describe what happened...");
    await user.type(textarea, "Wallet was stolen from coat check");

    const submitBtn = screen.getByText("Submit Report");
    expect(submitBtn).not.toBeDisabled();
  });

  it("submits the incident and shows success state", async () => {
    mockCreateIncident.mockResolvedValue({ id: "new-inc" });
    const user = userEvent.setup();
    renderDialog();

    await user.selectOptions(screen.getByRole("combobox"), "THEFT");
    await user.click(screen.getByText("HIGH"));
    await user.type(
      screen.getByPlaceholderText("Describe what happened..."),
      "Wallet stolen",
    );
    await user.click(screen.getByText("Submit Report"));

    await waitFor(() => {
      expect(screen.getByText("Report Submitted")).toBeInTheDocument();
    });
  });

  it("calls createIncident with correct payload", async () => {
    mockCreateIncident.mockResolvedValue({ id: "new-inc" });
    const user = userEvent.setup();
    renderDialog();

    await user.selectOptions(screen.getByRole("combobox"), "THEFT");
    await user.click(screen.getByText("MEDIUM"));
    await user.type(
      screen.getByPlaceholderText("Describe what happened..."),
      "Wallet stolen",
    );

    const kwInput = screen.getByPlaceholderText(
      "Type a keyword and press Enter",
    );
    await user.type(kwInput, "theft{Enter}");

    await user.click(screen.getByText("Submit Report"));

    await waitFor(() => {
      expect(mockCreateIncident).toHaveBeenCalledWith("mock-token", {
        venueId: "venue-1",
        type: "THEFT",
        severity: "MEDIUM",
        description: "Wallet stolen",
        keywords: ["theft"],
      });
    });
  });

  it("shows error message when submission fails", async () => {
    mockCreateIncident.mockRejectedValue(new Error("Server error"));
    const user = userEvent.setup();
    renderDialog();

    await user.selectOptions(screen.getByRole("combobox"), "THEFT");
    await user.click(screen.getByText("HIGH"));
    await user.type(
      screen.getByPlaceholderText("Describe what happened..."),
      "Wallet stolen",
    );
    await user.click(screen.getByText("Submit Report"));

    await waitFor(() => {
      expect(screen.getByText("Server error")).toBeInTheDocument();
    });
  });

  it('shows "Done" button after successful submission', async () => {
    mockCreateIncident.mockResolvedValue({ id: "new-inc" });
    const user = userEvent.setup();
    renderDialog();

    await user.selectOptions(screen.getByRole("combobox"), "THEFT");
    await user.click(screen.getByText("HIGH"));
    await user.type(
      screen.getByPlaceholderText("Describe what happened..."),
      "Wallet stolen",
    );
    await user.click(screen.getByText("Submit Report"));

    await waitFor(() => {
      expect(screen.getByText("Done")).toBeInTheDocument();
    });
  });
});

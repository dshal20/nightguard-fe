import { fireEvent, render, screen } from "@testing-library/react";
import VenueScan from "@/app/venue/[id]/scan/page";

describe("Venue Scan Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.URL.createObjectURL = jest.fn(() => "blob:preview");
  });

  it("keeps Scan License disabled until a back image is selected", () => {
    const { container } = render(<VenueScan />);
    const scanButton = screen.getByRole("button", { name: "Scan License" });
    expect(scanButton).toBeDisabled();

    const fileInputs = container.querySelectorAll("input[type='file']");
    const backInput = fileInputs[1] as HTMLInputElement;
    const file = new File(["img"], "back.jpg", { type: "image/jpeg" });
    fireEvent.change(backInput, { target: { files: [file] } });

    expect(scanButton).not.toBeDisabled();
    expect(screen.getByAltText("License Back")).toBeInTheDocument();
  });

  it("renders front and back upload slots on initial load", () => {
    render(<VenueScan />);
    expect(screen.getByText("Front")).toBeInTheDocument();
    expect(screen.getByText("Back")).toBeInTheDocument();
  });
});


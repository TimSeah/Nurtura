import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import JournalEntryForm from "../../../../src/pages/healthMonitoring/components/journal/JournalEntryForm";

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe("JournalEntryForm", () => {
  const mockRecipientId = "rec-123";
  const mockRecipientName = "John Doe";
  const mockOnSave = jest.fn();

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockOnSave.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders form with initial values", () => {
    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
      />
    );

    // Check initial field values
    expect(screen.getByLabelText("Title")).toHaveValue("");
    expect(screen.getByLabelText("Date")).toHaveValue(getTodayDate());
    expect(screen.getByLabelText("Description")).toHaveValue("");

    // Check placeholders
    expect(
      screen.getByPlaceholderText("Enter journal title...")
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        `${mockRecipientName}'s feelings and thoughts for today...`
      )
    ).toBeInTheDocument();

    // Check save button is disabled
    expect(screen.getByText("Save Journal")).toBeDisabled();
  });

  test("enables save button when form is valid", () => {
    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
      />
    );

    const saveButton = screen.getByText("Save Journal");
    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");

    // Initially disabled
    expect(saveButton).toBeDisabled();

    // Only title filled - still disabled
    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    expect(saveButton).toBeDisabled();

    // Only description filled - still disabled
    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });
    expect(saveButton).toBeDisabled();

    // Both filled - enabled
    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    expect(saveButton).toBeEnabled();
  });

  test("updates form fields correctly", () => {
    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
      />
    );

    const titleInput = screen.getByLabelText("Title");
    const dateInput = screen.getByLabelText("Date");
    const descriptionInput = screen.getByLabelText("Description");

    fireEvent.change(titleInput, { target: { value: "New Title" } });
    fireEvent.change(dateInput, { target: { value: "2023-01-01" } });
    fireEvent.change(descriptionInput, {
      target: { value: "New description" },
    });

    expect(titleInput).toHaveValue("New Title");
    expect(dateInput).toHaveValue("2023-01-01");
    expect(descriptionInput).toHaveValue("New description");
  });

  test("handles successful form submission", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
        onSave={mockOnSave}
      />
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Test description" },
    });

    fireEvent.click(screen.getByText("Save Journal"));

    // Check fetch call
    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:5000/api/journal", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientId: mockRecipientId,
          title: "Test Title",
          description: "Test description",
          date: getTodayDate(),
        }),
      });
    });

    // Wait for form reset to complete
    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toHaveValue("");
      expect(screen.getByLabelText("Description")).toHaveValue("");
      expect(screen.getByLabelText("Date")).toHaveValue(getTodayDate());
    });

    // Check callback called
    expect(mockOnSave).toHaveBeenCalled();
  });

  test("handles form submission failure", async () => {
    const errorMessage = "Network error";
    (fetch as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

    const alertMock = jest.spyOn(window, "alert").mockImplementation(() => {});

    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
      />
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText("Title"), {
      target: { value: "Test Title" },
    });
    fireEvent.change(screen.getByLabelText("Description"), {
      target: { value: "Test description" },
    });

    fireEvent.click(screen.getByText("Save Journal"));

    // Check error alert was shown
    await waitFor(() => {
      expect(alertMock).toHaveBeenCalledWith(
        "Error saving journal entry. Please try again."
      );
    });

    // Check console error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error saving journal:",
      new Error(errorMessage)
    );
  });

  test("shows validation alert for empty fields", async () => {
    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
      />
    );

    // Fill form with values then clear them to trigger validation
    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");
    const saveButton = screen.getByRole("button", { name: "Save Journal" });

    // Enter values to enable button
    fireEvent.change(titleInput, { target: { value: "Test Title" } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });

    // Clear fields to make form invalid
    fireEvent.change(titleInput, { target: { value: "" } });
    fireEvent.change(descriptionInput, { target: { value: "" } });

    // Click save button
    fireEvent.click(screen.getByText("Save Journal"));

    expect(saveButton).toBeDisabled();
    expect(fetch).not.toHaveBeenCalled();
  });

  test("trims whitespace from title during submission", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true });

    render(
      <JournalEntryForm
        recipientId={mockRecipientId}
        recipientName={mockRecipientName}
      />
    );

    const titleInput = screen.getByLabelText("Title");
    const descriptionInput = screen.getByLabelText("Description");

    // Enter values with surrounding whitespace
    fireEvent.change(titleInput, { target: { value: "  Test Title  " } });
    fireEvent.change(descriptionInput, {
      target: { value: "Test description" },
    });

    fireEvent.click(screen.getByText("Save Journal"));

    await waitFor(() => {
      // Verify the trimmed title was sent in the request
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/journal",
        expect.objectContaining({
          body: JSON.stringify({
            recipientId: mockRecipientId,
            title: "Test Title", // Trimmed value
            description: "Test description",
            date: getTodayDate(),
          }),
        })
      );
    });
  });
});

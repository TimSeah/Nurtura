import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import CareRecipientSelector from "../../../../src/pages/healthMonitoring/components/careRecipientSelector/CareRecipientSelector";
import { CareRecipient } from "../../../../src/types";

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

// Mock care recipients data
const mockRecipients: CareRecipient[] = [
  {
    _id: "1",
    name: "John Doe",
    dateOfBirth: "1970-01-01",
    relationship: "Father",
    medicalConditions: ["Hypertension", "Diabetes"],
    emergencyContacts: [
      {
        name: "Jane Doe",
        phone: "1234567890",
        email: "jane@gmail.com",
        relationship: "Spouse",
      },
    ],
    medications: [
      {
        name: "Aspirin",
        dosage: "100mg",
        frequency: "Daily",
        startDate: "2024-01-01",
        endDate: "2024-12-31",
        notes: "Take with food",
      },
    ],
    caregiverNotes: "Monitor blood pressure daily",
    isActive: true,
  },
  {
    _id: "2",
    name: "Mary Smith",
    dateOfBirth: "1965-05-15",
    relationship: "Mother",
    medicalConditions: ["Arthritis"],
    emergencyContacts: [],
    medications: [],
    caregiverNotes: "",
    isActive: true,
  },
];

describe("CareRecipientSelector", () => {
  const mockOnRecipientChange = jest.fn();
  const mockOnAddRecipient = jest.fn();
  const mockOnRetry = jest.fn();
  const mockOnRecipientUpdated = jest.fn();

  const defaultProps = {
    careRecipients: mockRecipients,
    selectedRecipient: "",
    loading: false,
    error: null,
    isAddingRecipient: false,
    onRecipientChange: mockOnRecipientChange,
    onAddRecipient: mockOnAddRecipient,
    onRetry: mockOnRetry,
    onRecipientUpdated: mockOnRecipientUpdated,
  };

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockOnRecipientChange.mockClear();
    mockOnAddRecipient.mockClear();
    mockOnRetry.mockClear();
    mockOnRecipientUpdated.mockClear();
    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(window, "alert").mockImplementation(() => {});
    jest.spyOn(window, "confirm").mockImplementation(() => true);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("renders care recipients list", () => {
    render(<CareRecipientSelector {...defaultProps} />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Mary Smith")).toBeInTheDocument();
  });

  test("shows loading state", () => {
    render(<CareRecipientSelector {...defaultProps} loading={true} />);

    expect(screen.getByText("Loading care recipients...")).toBeInTheDocument();
  });

  test("shows error state", () => {
    render(<CareRecipientSelector {...defaultProps} error="Failed to load" />);

    expect(
      screen.getByText(/Error loading care recipients/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Failed to load/)).toBeInTheDocument();
    expect(screen.getByText("Retry")).toBeInTheDocument();
  });

  test("calls onRecipientChange when recipient is selected", () => {
    render(<CareRecipientSelector {...defaultProps} />);

    fireEvent.click(screen.getByText("John Doe"));

    expect(mockOnRecipientChange).toHaveBeenCalledWith("1");
  });

  test("shows edit and delete buttons only when recipient is selected", () => {
    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    expect(screen.getByTitle("Edit recipient")).toBeInTheDocument();
    expect(screen.getByTitle("Delete recipient")).toBeInTheDocument();
  });

  test("does not show action buttons when no recipient is selected", () => {
    render(<CareRecipientSelector {...defaultProps} />);

    expect(screen.queryByTitle("Edit recipient")).not.toBeInTheDocument();
    expect(screen.queryByTitle("Delete recipient")).not.toBeInTheDocument();
  });

  test("opens edit modal when edit button is clicked", () => {
    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click Edit button (which appears on selected card)
    const editButton = screen.getByTitle("Edit recipient");
    fireEvent.click(editButton);

    // Should first show the modal with recipient details (be more specific)
    expect(screen.getByText("Edit")).toBeInTheDocument(); // The Edit button in modal

    // Click the Edit button in the modal
    const modalEditButton = screen.getByText("Edit");
    fireEvent.click(modalEditButton);

    // Now should show the edit form
    expect(screen.getByText("Edit Care Recipient")).toBeInTheDocument();
    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Father")).toBeInTheDocument();
  });

  test("updates care recipient successfully", async () => {
    const user = userEvent.setup();

    // Mock successful update
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        ...mockRecipients[0],
        name: "John Updated Doe",
        relationship: "Uncle",
      }),
    });

    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click Edit button (which appears on selected card)
    const editButton = screen.getByTitle("Edit recipient");
    fireEvent.click(editButton);

    // Click the Edit button in the modal to access edit form
    const modalEditButton = screen.getByText("Edit");
    fireEvent.click(modalEditButton);

    // Update name and relationship
    const nameInput = screen.getByDisplayValue("John Doe");
    await user.clear(nameInput);
    await user.type(nameInput, "John Updated Doe");

    const relationshipInput = screen.getByDisplayValue("Father");
    await user.clear(relationshipInput);
    await user.type(relationshipInput, "Uncle");

    // Save changes
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/care-recipients/1"),
        expect.objectContaining({
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: expect.stringContaining('"name":"John Updated Doe"'),
        })
      );
      expect(mockOnRecipientUpdated).toHaveBeenCalled();
    });
  });

  test("deletes care recipient successfully", async () => {
    // Mock successful delete
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Care recipient deleted successfully" }),
    });

    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click delete button
    const deleteButton = screen.getByTitle("Delete recipient");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/care-recipients/1"),
        {
          method: "DELETE",
          credentials: "include",
        }
      );
      expect(mockOnRecipientUpdated).toHaveBeenCalled();
    });
  });

  test("handles edit API error", async () => {
    const user = userEvent.setup();

    // Mock API error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click Edit button (which appears on selected card)
    const editButton = screen.getByTitle("Edit recipient");
    fireEvent.click(editButton);

    // Click the Edit button in the modal to access edit form
    const modalEditButton = screen.getByText("Edit");
    fireEvent.click(modalEditButton);

    // Update name
    const nameInput = screen.getByDisplayValue("John Doe");
    await user.clear(nameInput);
    await user.type(nameInput, "Updated Name");

    // Try to save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error updating care recipient:",
        expect.any(Error)
      );
    });
  });

  test("handles delete API error", async () => {
    // Mock API error
    (fetch as jest.Mock).mockRejectedValueOnce(new Error("API Error"));

    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Try to delete
    const deleteButton = screen.getByTitle("Delete recipient");
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
        "Error deleting care recipient:",
        expect.any(Error)
      );
    });
  });

  test("closes edit modal when cancel is clicked", () => {
    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click Edit button (which appears on selected card)
    const editButton = screen.getByTitle("Edit recipient");
    fireEvent.click(editButton);

    // Click the Edit button in the modal to access edit form
    const modalEditButton = screen.getByText("Edit");
    fireEvent.click(modalEditButton);

    expect(screen.getByText("Edit Care Recipient")).toBeInTheDocument();

    // Click cancel
    fireEvent.click(screen.getByText("Cancel"));

    expect(screen.queryByText("Edit Care Recipient")).not.toBeInTheDocument();
  });

  test("validates required fields in edit modal", async () => {
    const user = userEvent.setup();
    window.alert = jest.fn();

    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click Edit button (which appears on selected card)
    const editButton = screen.getByTitle("Edit recipient");
    fireEvent.click(editButton);

    // Click the Edit button in the modal to access edit form
    const modalEditButton = screen.getByText("Edit");
    fireEvent.click(modalEditButton);

    // Clear required field
    const nameInput = screen.getByDisplayValue("John Doe");
    await user.clear(nameInput);

    // Try to save
    fireEvent.click(screen.getByText("Save Changes"));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith(
        "Error updating care recipient. Please try again."
      );
    });
  });

  test("adds and removes medical conditions dynamically", async () => {
    render(<CareRecipientSelector {...defaultProps} selectedRecipient="1" />);

    // Click Edit button (which appears on selected card)
    const editButton = screen.getByTitle("Edit recipient");
    fireEvent.click(editButton);

    // Click the Edit button in the modal to access edit form
    const modalEditButton = screen.getByText("Edit");
    fireEvent.click(modalEditButton);

    // Should show existing medical conditions
    expect(screen.getByDisplayValue("Hypertension")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Diabetes")).toBeInTheDocument();

    // Add a new condition
    fireEvent.click(screen.getByText("Add Medical Condition"));

    const conditionInputs = screen.getAllByPlaceholderText("Medical condition");
    expect(conditionInputs.length).toBe(3); // 2 existing + 1 new

    // Remove a condition
    const removeButtons = screen.getAllByText("×");
    fireEvent.click(removeButtons[0]);

    expect(screen.getAllByPlaceholderText("Medical condition").length).toBe(2);
  });

  test("calls onAddRecipient when add button is clicked", () => {
    render(<CareRecipientSelector {...defaultProps} />);

    const addButton = screen.getByText("Add Care Recipient");
    fireEvent.click(addButton);

    expect(mockOnAddRecipient).toHaveBeenCalled();
  });

  test("calls onRetry when retry button is clicked in error state", () => {
    render(<CareRecipientSelector {...defaultProps} error="Failed to load" />);

    const retryButton = screen.getByText("Retry");
    fireEvent.click(retryButton);

    expect(mockOnRetry).toHaveBeenCalled();
  });
});

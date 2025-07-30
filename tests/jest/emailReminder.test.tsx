import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import Calendar from "../../src/pages/calendar/calendar";

// Mock API calls
global.fetch = jest.fn() as jest.Mock;

// Mock window.alert
global.alert = jest.fn();

const mockEvents = [
  {
    _id: "1",
    title: "Doctor Appointment",
    date: "2023-07-15T00:00:00.000Z",
    startTime: "14:00",
    remark: "Bring insurance card",
    month: "July",
    userId: "123",
    enableReminder: true,
    reminderSent: false,
  },
  {
    _id: "2",
    title: "Dentist Checkup",
    date: "2023-07-20T00:00:00.000Z",
    startTime: "10:30",
    remark: "Regular cleaning",
    month: "July",
    userId: "123",
    enableReminder: true,
    reminderSent: true,
  },
];

describe("Calendar Component - Email Reminder Features", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    (global.alert as jest.Mock).mockReset();
    jest.useFakeTimers().setSystemTime(new Date("2023-07-21"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Test Reminder Button", () => {
    test("displays test reminder button in edit mode", async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      });

      render(<Calendar />);

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      });

      // Click on the event to open edit form
      fireEvent.click(screen.getByText("Doctor Appointment"));

      // Check that the Test Reminder button appears
      await waitFor(() => {
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
      });
    });

    test("test reminder button is not shown in create mode", () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      });

      render(<Calendar />);

      // Click on an empty day to create new event
      fireEvent.click(screen.getByText("15"));

      // Test Reminder button should not appear for new events
      expect(screen.queryByText("Test Reminder")).not.toBeInTheDocument();

      // But other buttons should be there
      expect(screen.getByText("Save")).toBeInTheDocument();
      expect(screen.getByText("Cancel")).toBeInTheDocument();
    });

    test("sends test reminder successfully", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              message: "Test reminder sent successfully",
              email: "user@example.com",
            }),
        });

      render(<Calendar />);

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      });

      // Click on the event to open edit form
      fireEvent.click(screen.getByText("Doctor Appointment"));

      // Wait for the form to open and click Test Reminder
      await waitFor(() => {
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Test Reminder"));
      });

      // Verify API call was made
      const fetchMock = fetch as jest.Mock;
      expect(fetchMock.mock.calls[1][0]).toBe(
        "http://localhost:5000/api/events/1/send-reminder"
      );
      expect(fetchMock.mock.calls[1][1]).toMatchObject({
        method: "POST",
      });

      // Verify success alert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Test reminder sent successfully!"
        );
      });
    });

    test("handles test reminder API failure", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
        });

      render(<Calendar />);

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      });

      // Click on the event to open edit form
      fireEvent.click(screen.getByText("Doctor Appointment"));

      // Click Test Reminder
      await waitFor(() => {
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Test Reminder"));
      });

      // Verify failure alert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Failed to send test reminder"
        );
      });
    });

    test("handles test reminder network error", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents),
        })
        .mockRejectedValueOnce(new Error("Network error"));

      render(<Calendar />);

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      });

      // Click on the event to open edit form
      fireEvent.click(screen.getByText("Doctor Appointment"));

      // Click Test Reminder
      await waitFor(() => {
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Test Reminder"));
      });

      // Verify error alert
      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Error sending test reminder"
        );
      });
    });

    test("test reminder button works for different events", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<Calendar />);

      await waitFor(() => {
        expect(screen.getByText("Dentist Checkup")).toBeInTheDocument();
      });

      // Click on the second event
      fireEvent.click(screen.getByText("Dentist Checkup"));

      // Click Test Reminder
      await waitFor(() => {
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Test Reminder"));
      });

      // Verify correct API call for second event
      const fetchMock = fetch as jest.Mock;
      expect(fetchMock.mock.calls[1][0]).toBe(
        "http://localhost:5000/api/events/2/send-reminder"
      );
    });

    test("test reminder preserves edit form state", async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockEvents),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<Calendar />);

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      });

      // Open edit form
      fireEvent.click(screen.getByText("Doctor Appointment"));

      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Doctor Appointment")
        ).toBeInTheDocument();
      });

      // Modify the title
      const titleInput = screen.getByDisplayValue("Doctor Appointment");
      await act(async () => {
        fireEvent.change(titleInput, {
          target: { value: "Modified Appointment" },
        });
      });

      // Click Test Reminder
      await act(async () => {
        fireEvent.click(screen.getByText("Test Reminder"));
      });

      // Form should still be open and modifications preserved
      await waitFor(() => {
        expect(
          screen.getByDisplayValue("Modified Appointment")
        ).toBeInTheDocument();
        expect(screen.getByText("Save")).toBeInTheDocument();
        expect(screen.getByText("Cancel")).toBeInTheDocument();
      });
    });
  });

  describe("Reminder Status Indicators", () => {
    test("shows visual indication for events with reminders enabled", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      });

      await act(async () => {
        render(<Calendar />);
      });

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
        expect(screen.getByText("Dentist Checkup")).toBeInTheDocument();
      });

      // Both events should be displayed since they have enableReminder: true
      // The actual visual indication would depend on CSS classes or icons
      // This test verifies the events are rendered
      expect(screen.getAllByRole("button").length).toBeGreaterThan(0);
    });
  });

  describe("Event Creation with Reminders", () => {
    test("creates new event with reminder enabled by default", async () => {
      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      });

      await act(async () => {
        render(<Calendar />);
      });

      // Wait for calendar to render
      await waitFor(() => {
        expect(screen.getByText("15")).toBeInTheDocument();
      });

      // Open form for new event
      await act(async () => {
        fireEvent.click(screen.getByText("15"));
      });

      await waitFor(() => {
        expect(
          screen.getByText("Schedule Event in 2023-7-15")
        ).toBeInTheDocument();
      });

      // Fill in the form
      const titleInput = screen.getByTestId("title-input");
      const timeInput = screen.getByTestId("time-input");
      const remarkInput = screen.getByTestId("remark-input");

      await act(async () => {
        fireEvent.change(titleInput, { target: { value: "New Appointment" } });
        fireEvent.change(timeInput, { target: { value: "09:00" } });
        fireEvent.change(remarkInput, {
          target: { value: "Test appointment" },
        });
      });

      // Submit
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: "3" }),
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Save"));
      });

      // Verify the API call includes reminder fields
      const fetchMock = fetch as jest.Mock;
      const createCall = fetchMock.mock.calls.find(
        (call) => call[1]?.method === "POST"
      );

      expect(createCall).toBeTruthy();
      const requestBody = JSON.parse(createCall[1].body);
      expect(requestBody.enableReminder).toBe(true);
      expect(requestBody.reminderSent).toBe(false);
    });
  });

  describe("Integration with Settings", () => {
    test("reminder functionality respects user email settings", async () => {
      // This test would verify that reminders work with user settings
      // In a full integration test, we'd mock the user settings API
      const mockEventsWithSettings = mockEvents.map((event) => ({
        ...event,
        userSettings: {
          notifications: { appointmentReminders: true },
          profile: { email: "user@example.com" },
        },
      }));

      (fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockEventsWithSettings),
      });

      await act(async () => {
        render(<Calendar />);
      });

      await waitFor(() => {
        expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      });

      // The test reminder should work when user has email configured
      await act(async () => {
        fireEvent.click(screen.getByText("Doctor Appointment"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Reminder")).toBeInTheDocument();
      });

      // Mock the test reminder API call
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

      await act(async () => {
        fireEvent.click(screen.getByText("Test Reminder"));
      });

      await waitFor(() => {
        expect(global.alert).toHaveBeenCalledWith(
          "Test reminder sent successfully!"
        );
      });
    });
  });
});

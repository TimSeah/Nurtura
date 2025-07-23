import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
// src/setupTests.ts
import "@testing-library/jest-dom"; // Only this import is needed
import userEvent from "@testing-library/user-event";
import Calendar from "./calendar";

// Mock API calls
global.fetch = jest.fn() as jest.Mock;

const mockEvents = [
  {
    _id: "1",
    title: "Team Meeting",
    date: "2023-07-15T00:00:00.000Z",
    startTime: "14:00",
    remark: "Quarterly planning",
    month: "July",
    userId: "123",
  },
  {
    _id: "2",
    title: "Doctor Appointment",
    date: "2023-07-20T00:00:00.000Z",
    startTime: "10:30",
    remark: "Bring medical reports",
    month: "July",
    userId: "123",
  },
];

describe("Calendar Component", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    jest.useFakeTimers().setSystemTime(new Date("2023-07-21"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders current month and year", () => {
    render(<Calendar />);
    expect(screen.getByText("July 2023")).toBeInTheDocument();
  });

  test("navigates to next month", () => {
    render(<Calendar />);
    fireEvent.click(screen.getByText("Next Month >"));
    expect(screen.getByText("August 2023")).toBeInTheDocument();
  });

  test("navigates to previous month", () => {
    render(<Calendar />);
    fireEvent.click(screen.getByText("< Previous Month"));
    expect(screen.getByText("June 2023")).toBeInTheDocument();
  });

  test("highlights current day", () => {
    render(<Calendar />);
    const todayCell = screen.getByText("21").closest(".calendar-day");
    expect(todayCell).toHaveClass("today");
  });

  test("opens event form on day click", () => {
    render(<Calendar />);
    fireEvent.click(screen.getByText("15"));
    expect(screen.getByText("Schedule Event in 2023-7-15")).toBeInTheDocument();
  });

  test("displays events from API", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    });

    render(<Calendar />);

    await waitFor(() => {
      expect(screen.getByText("Team Meeting")).toBeInTheDocument();
      expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
    });
  });

  test("creates new event", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([]) }) // Initial fetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ _id: "3" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([
            ...mockEvents,
            {
              _id: "3",
              title: "New Event",
              date: "2023-07-25T00:00:00.000Z",
              startTime: "09:00",
              remark: "Test remark",
              month: "July",
              userId: "123",
            },
          ]),
      }); // Re-fetch updated event list

    render(<Calendar />);
    // screen.debug();

    // Open form for day 25
    fireEvent.click(await screen.findByText("2"));

    await waitFor(() => {
      expect(
        screen.getByText("Schedule Event in 2023-7-2")
      ).toBeInTheDocument();
    });

    const titleInput = screen.getByTestId("title-input");
    const timeInput = screen.getByTestId("time-input");
    const remarkInput = screen.getByTestId("remark-input");

    jest.useRealTimers();

    await userEvent.type(titleInput, "New Event");
    await userEvent.type(timeInput, "09:00");
    await userEvent.type(remarkInput, "Test remark");

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    const fetchMock = fetch as jest.Mock;
    expect(fetchMock.mock.calls[1][0]).toBe(
      // Refresh, GET method
      "http://localhost:5000/api/events/"
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      // POST method
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "New Event",
        date: "2023-07-21T00:00:00.000Z",
        startTime: "09:00",
        remark: "Test remark",
        month: "July",
        userId: "123",
        enableReminder: true,
        reminderSent: false,
      }),
    });
  });

  test("edits existing event", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      })
      .mockResolvedValueOnce({ ok: true });

    render(<Calendar />);

    jest.useRealTimers();

    await screen.findByText("Team Meeting");

    fireEvent.click(screen.getByText("Team Meeting"));

    const titleInput = screen.getByDisplayValue("Team Meeting");
    const timeInput = screen.getByDisplayValue("14:00");
    const remarkInput = screen.getByPlaceholderText("Quarterly planning");

    console.log("All widgets found");

    await userEvent.clear(titleInput);
    await userEvent.type(titleInput, "Updated");
    await userEvent.clear(remarkInput);
    await userEvent.type(remarkInput, "Updated");
    await userEvent.clear(timeInput);
    await userEvent.type(timeInput, "11:11");

    console.log("All updates typed");

    // Submit
    await act(async () => {
      fireEvent.click(screen.getByText("Save"));
    });

    const fetchMock = fetch as jest.Mock;
    expect(fetchMock.mock.calls[1][0]).toBe(
      // Refresh, GET method
      "http://localhost:5000/api/events/1"
    );
    expect(fetchMock.mock.calls[1][1]).toMatchObject({
      // PUT method
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        _id: "1",
        title: "Updated",
        date: "2023-07-15T00:00:00.000Z",
        startTime: "11:11",
        remark: "Updated",
        month: "July",
        userId: "123",
      }),
    });
  });

  test("deletes event", async () => {
    (fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockEvents),
      })
      .mockResolvedValueOnce({ ok: true }); // Delete

    render(<Calendar />);
    screen.debug();

    // Wait for events to load
    await screen.findByText("Team Meeting");

    // Click on event to edit
    fireEvent.click(screen.getByText("Team Meeting"));

    // Delete
    fireEvent.click(screen.getByText("Delete"));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/events/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});

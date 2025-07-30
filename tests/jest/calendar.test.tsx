import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { AuthContext } from "../../src/contexts/AuthContext";

const fakeCtx = {
  user: { username: "test‑user" },
  loading: false,
  login: async () => Promise.resolve(true), // stub
  logout: async () => Promise.resolve(), // stub
};

// src/setupTests.ts
import "@testing-library/jest-dom"; // Only this import is needed
import userEvent from "@testing-library/user-event";
import Calendar from "../../src/pages/calendar/calendar";

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
    //userId: "123",  grabs req.auth._id from the JWT cookie, so the client never needs to send it
  },
  {
    _id: "2",
    title: "Doctor Appointment",
    date: "2023-07-20T00:00:00.000Z",
    startTime: "10:30",
    remark: "Bring medical reports",
    month: "July",
    //userId: "123", grabs req.auth._id from the JWT cookie, so the client never needs to send it
  },
];

describe("Calendar Component", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockReset();
    // Default mock for month fetch
    (fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve([]),
    });
    jest.useFakeTimers().setSystemTime(new Date("2023-07-21"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("renders current month and year", async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    expect(screen.getByText("July 2023")).toBeInTheDocument();
  });

  test("navigates to next month", async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByText("Next Month >"));
    });
    expect(screen.getByText("August 2023")).toBeInTheDocument();
  });

  test("navigates to previous month", async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByText("< Previous Month"));
    });
    expect(screen.getByText("June 2023")).toBeInTheDocument();
  });

  test("highlights current day", async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    const todayCell = screen.getByText("21").closest(".calendar-day");
    expect(todayCell).toHaveClass("today");
  });

  test("opens event form on day click", async () => {
    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    await act(async () => {
      fireEvent.click(screen.getByText("15"));
    });
    expect(screen.getByText("Schedule Event in 2023-7-15")).toBeInTheDocument();
  });

  test("displays events from API", async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockEvents),
    });

    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });

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
              // userId: "123",
            },
          ]),
      }); // Re-fetch updated event list

    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    // screen.debug();

    // Open form for day 25
    const dayElement = await screen.findByText("2");
    await act(async () => {
      fireEvent.click(dayElement);
    });

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
        //userId: "123",   grabs req.auth._id from the JWT cookie, so the client never needs to send it
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

    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });

    jest.useRealTimers();

    await screen.findByText("Team Meeting");

    await act(async () => {
      fireEvent.click(screen.getByText("Team Meeting"));
    });

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
        //userId: "123",  grabs req.auth._id from the JWT cookie, so the client never needs to send it
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

    await act(async () => {
      render(
        <AuthContext.Provider value={fakeCtx}>
          <Calendar />
        </AuthContext.Provider>
      );
    });
    screen.debug();

    // Wait for events to load
    await screen.findByText("Team Meeting");

    // Click on event to edit
    await act(async () => {
      fireEvent.click(screen.getByText("Team Meeting"));
    });

    // Delete
    await act(async () => {
      fireEvent.click(screen.getByText("Delete"));
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/events/1",
        expect.objectContaining({ method: "DELETE" })
      );
    });
  });
});

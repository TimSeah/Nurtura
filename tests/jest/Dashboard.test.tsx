import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Dashboard from "../../src/pages/dashboard/Dashboard";
import { AuthContext } from "../../src/contexts/AuthContext";
import { apiService } from "../../src/services/apiService";
import "@testing-library/jest-dom";

// Mock API service
jest.mock("../../src/services/apiService", () => ({
  apiService: {
    getTodaysEvents: jest.fn(),
    addVitalSigns: jest.fn(),
  },
}));

// Mock Lucide icons
jest.mock("lucide-react", () => ({
  Activity: () => <div>ActivityIcon</div>,
  Calendar: () => <div>CalendarIcon</div>,
  Users: () => <div>UsersIcon</div>,
  BookPlus: () => <div>BookPlusIcon</div>,
  Heart: () => <div>HeartIcon</div>,
  Clock: () => <div>ClockIcon</div>,
  TrendingUp: () => <div>TrendingUpIcon</div>,
  Bell: () => <div>BellIcon</div>,
}));

// Mock images
jest.mock("./components/pics/koala.png", () => "koala.png");

describe("Dashboard Component", () => {
  const mockUser = {
    username: "JohnDoe",
    userId: "123",
    token: "test-token",
  };

  const mockAuthContext = {
    user: mockUser,
    login: jest.fn(),
    logout: jest.fn(),
  };

  const mockEvents = [
    {
      title: "Doctor Appointment",
      startTime: "10:00 AM",
      remark: "Annual checkup",
    },
    {
      title: "Medication Reminder",
      startTime: "02:30 PM",
      remark: "Take blood pressure pills",
    },
  ];

  const renderDashboard = () => {
    const completeMockAuthContext = {
      ...mockAuthContext,
      loading: false, // Add the missing property
      refreshToken: jest.fn(), // Add other required properties if any
    };
    return render(
      <MemoryRouter>
        <AuthContext.Provider value={completeMockAuthContext}>
          <Dashboard />
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  beforeEach(() => {
    (apiService.getTodaysEvents as jest.Mock).mockReset();
    (apiService.addVitalSigns as jest.Mock).mockReset();
  });

  test("renders welcome message with username", () => {
    renderDashboard();
    expect(
      screen.getByText((content) => content.includes("Welcome back,"))
    ).toBeInTheDocument();
  });

  test("displays all dashboard stats cards", () => {
    renderDashboard();

    expect(screen.getByText("Monitor Recipients")).toBeInTheDocument();
    expect(screen.getByText("View Calendar")).toBeInTheDocument();
    expect(screen.getByText("Ask in Forum")).toBeInTheDocument();
    expect(screen.getByText("See Caregiver Resources")).toBeInTheDocument();

    // Verify icons
    expect(screen.getAllByText("ActivityIcon").length).toBeGreaterThan(0);
    expect(screen.getAllByText("CalendarIcon").length).toBeGreaterThan(0);
  });

  test("displays no events message when there are no tasks", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue([]);
    renderDashboard();

    await waitFor(() => {
      expect(
        screen.getByText("Nothing for today. Have a wonderful day ahead!")
      ).toBeInTheDocument();
    });
  });

  test("displays today's tasks when events exist", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockResolvedValue(mockEvents);
    renderDashboard();

    await waitFor(() => {
      expect(screen.getByText("Doctor Appointment")).toBeInTheDocument();
      expect(screen.getByText("10:00 AM")).toBeInTheDocument();
      expect(screen.getByText("Annual checkup")).toBeInTheDocument();

      expect(screen.getByText("Medication Reminder")).toBeInTheDocument();
      expect(screen.getByText("02:30 PM")).toBeInTheDocument();
    });
  });

  test("displays recent activities", () => {
    renderDashboard();

    expect(
      screen.getByText("Blood pressure medication taken by Eleanor")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Blood glucose reading recorded: 125 mg/dL")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Cardiology appointment scheduled for John")
    ).toBeInTheDocument();
  });

  test("handles API errors gracefully", async () => {
    (apiService.getTodaysEvents as jest.Mock).mockRejectedValue(
      new Error("API Error")
    );

    const consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    renderDashboard();

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error fetching dashboard data:",
        expect.any(Error)
      );
    });

    consoleErrorSpy.mockRestore();
  });

  test("navigates to correct routes from stats cards", () => {
    renderDashboard();

    const healthLink = screen
      .getByText("Monitor Recipients")
      .closest("a") as HTMLAnchorElement;
    const calendarLink = screen
      .getByText("View Calendar")
      .closest("a") as HTMLAnchorElement;

    expect(healthLink?.href).toContain("/health");
    expect(calendarLink?.href).toContain("/calendar");
  });

  test("displays priority indicators for activities", () => {
    renderDashboard();

    const highPriority = screen
      .getByText("Cardiology appointment scheduled for John")
      .closest(".activity-item")
      ?.querySelector(".activity-priority");

    expect(highPriority).toHaveClass("priority-high");
  });
});

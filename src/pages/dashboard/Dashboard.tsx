import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom"; // Removed unused import
import { AuthContext } from "../../contexts/AuthContext";
import {
  Activity,
  Calendar,
  Users,
  BookPlus,
  Heart,
  Clock,
  TrendingUp,
  Bell,
} from "lucide-react";
import "./Dashboard.css";
import { apiService } from "../../services/apiService";
// Removed unused type imports - can be added back when needed
// import type {
//   VitalSignsData,
//   AppointmentData,
//   CareNoteData,
// } from "../../types";

import koala from "./components/pics/koala.png";

interface Event {
  title: string;
  startTime: string;
  remark: string;
}

interface DashboardStat {
  icon: React.ElementType;
  color: string;
  action: string;
  link: string;
}

interface RecentActivity {
  id: string;
  type: "medication" | "appointment" | "vital" | "care";
  description: string;
  time: string;
  priority?: "low" | "medium" | "high";
}

const Dashboard: React.FC = () => {
  // const navigate = useNavigate(); // Removed unused variable
  // const [showVitalSignsModal, setShowVitalSignsModal] = useState(false); // Removed unused state
  // const [showAppointmentModal, setShowAppointmentModal] = useState(false); // Removed unused state
  // const [showCareNoteModal, setShowCareNoteModal] = useState(false); // Removed unused state
  const { user } = useContext(AuthContext);

  // Removed unused handler functions - can be added back when modals are implemented
  // const handleVitalSignsSave = async (data: VitalSignsData) => {
  //   try {
  //     console.log("Saving vital signs to backend:", data);
  //     const savedVitalSigns = await apiService.addVitalSigns(data);
  //     console.log("Vital signs saved successfully:", savedVitalSigns);
  //     alert("Vital signs recorded successfully!");
  //   } catch (error) {
  //     console.error("Error saving vital signs:", error);
  //     alert("Failed to save vital signs. Please try again.");
  //   }
  // };

  // const handleAppointmentSave = (data: AppointmentData) => {
  //   console.log("Appointment saved:", data);
  // };

  // const handleCareNoteSave = (data: CareNoteData) => {
  //   console.log("Care note saved:", data);
  // };

  const stats: DashboardStat[] = [
    {
      icon: Activity,
      color: "#0f766e",
      action: "Monitor Recipients",
      link: "/health",
    },
    {
      icon: Calendar,
      color: "#7c3aed",
      action: "View Calendar",
      link: "/calendar",
    },
    {
      icon: Users,
      color: "#dc2626",
      action: "Ask in Forum",
      link: "/forum",
    },
    {
      icon: BookPlus,
      color: "#ea580c",
      action: "See Caregiver Resources",
      link: "/resources",
    },
  ];

  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "medication":
        return Heart;
      case "appointment":
        return Calendar;
      case "vital":
        return Activity;
      case "care":
        return Users;
      default:
        return Bell;
    }
  };

  const getStatIconClass = (color: string) => {
    switch (color) {
      case "#0f766e":
        return "stat-icon--teal";
      case "#7c3aed":
        return "stat-icon--purple";
      case "#dc2626":
        return "stat-icon--red";
      case "#ea580c":
        return "stat-icon--orange";
      default:
        return "stat-icon--teal";
    }
  };

  const getPriorityClass = (priority?: string) => {
    switch (priority) {
      case "high":
        return "priority-high";
      case "medium":
        return "priority-medium";
      case "low":
        return "priority-low";
      default:
        return "priority-default";
    }
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch today's events
        const eventsData = await apiService.getTodaysEvents();
        setTodayEvents(eventsData);

        // Load other dashboard data
        loadStats();
        loadRecentActivities();
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      }
    };

    fetchDashboardData();
  }, []);

  const loadStats = async () => {
    try {
      // You can enhance this to fetch real stats from backend
      // For now, keeping the mock data structure
    } catch (error) {
      console.error("Error loading stats:", error);
    }
  };

  const loadRecentActivities = async () => {
    try {
      // Fetch recent vital signs from backend
      const vitalSignsActivities = await apiService.getRecentVitalSigns(5);
      
      // You can also fetch other types of activities here and combine them
      // For now, we'll just use vital signs data
      setRecentActivities(vitalSignsActivities);
    } catch (error) {
      console.error("Error loading recent activities:", error);
      // Fallback to empty array or show error message
      setRecentActivities([]);
    }
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <img src={koala}></img>
        <h1>
          Welcome back,{" "}
          <span className="gradient-name-header">
            {user ? user.username : "Guest"}{" "}
          </span>
        </h1>
        <p>How can we help you today?</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <a href={stat.link} key={stat.action}>
              <div className="stat-card">
                <div className={`stat-icon ${getStatIconClass(stat.color)}`}>
                  <Icon />
                </div>
                <div className="stat-content">
                  <h3 className="stat-label">{stat.action}</h3>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <div className="dashboard-grid">
        {/* Today's Tasks */}
        <div className="card">
          <div className="card-header dashboard-card">
            <h2 className="card-title">
              <Clock className="title-icon" />
              Today's Tasks
            </h2>
          </div>
          <div className="task-list">
            {todayEvents.length === 0 ? (
              <h3 className="no-events-today">
                Nothing for today. Have a wonderful day ahead!
              </h3>
            ) : (
              <>
                {todayEvents.map((event) => (
                  <div key={event.title} className="task-item">
                    <div className="task-content">
                      <h4>{event.title}</h4>
                      <p className="task-time">{event.startTime}</p>
                      <p className="task-remark">{event.remark}</p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="card-header dashboard-card">
            <h2 className="card-title">
              <TrendingUp className="title-icon" />
              Recent Activity
            </h2>
          </div>
          <div className="activity-list">
            {recentActivities.length === 0 ? (
              <div className="no-activities">
                <p>No recent vital signs recorded.</p>
                <p className="activity-time">Start monitoring health by adding vital signs!</p>
              </div>
            ) : (
              recentActivities.map((activity) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <div key={activity.id} className="activity-item">
                    <div className="activity-icon">
                      <Icon />
                    </div>
                    <div className="activity-content">
                      <p>{activity.description}</p>
                      <span className="activity-time">{activity.time}</span>
                    </div>
                    <div
                      className={`activity-priority ${getPriorityClass(
                        activity.priority
                      )}`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

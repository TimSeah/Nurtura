import React from "react";
import "./App.css";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Calendar from "./pages/calendar/calendar";
import HealthTracking from "./pages/healthMonitoring/HealthTracking";
import Resources from "./pages/resources/Resources";
import Settings from "./pages/settings/Settings";
import Forum from "./pages/forum/forum";
import ForumTab from "./pages/forum/ForumTab";
import ThreadDetail from "./pages/forum/threadDetail";
import Landing from "./pages/landing/Landing";
import ResourcesAlt from "./pages/ResorucesAlt";
import HealthMonitoring from "./pages/healthMonitoring/components/add new recipient/HealthMonitoring";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useContext(AuthContext);

  // Still loading auth check so we show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Auth check complete - not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated user
  return children;
}

// Loading component for the main app
function AppLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
        <p className="text-gray-700 text-lg font-medium">Loading ....</p>
      </div>
    </div>
  );
}

function App() {
  const { loading } = useContext(AuthContext);

  // Show loading screen while checking initial auth status
  if (loading) {
    return <AppLoading />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/landing" element={<Landing />} />
      <Route path="/threads/:id" element={<ThreadDetail />} />
      {/* Protected routes - requires login + shows Layout */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/start" element={<Dashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forumTab" element={<ForumTab />} />
        
        <Route path="/health" element={<HealthTracking />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resourcesAlt" element={<ResourcesAlt />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/healthmonitoring" element={<HealthMonitoring />} />

        {/* Catch all unknown URLs → redirect home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

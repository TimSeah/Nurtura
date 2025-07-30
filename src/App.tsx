import "./App.css";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Navigate } from "react-router-dom";
import Dashboard from "./pages/dashboard/Dashboard";
import Calendar from "./pages/calendar/calendar";
import HealthTracking from "./pages/healthMonitoring/HealthTracking";
import CareCircle from "./pages/CareCircle";
import Resources from "./pages/Resources";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Forum from "./pages/forum/Forum";
import ForumTab from "./pages/forum/ForumTab";
import ThreadDetail from "./pages/forum/ThreadDetail";
// import Journal from "./pages/healthMonitoring/components/journal/journal";
import ResourcesAlt from "./pages/ResorucesAlt";
import HealthMonitoring from "./pages/healthMonitoring/components/add new recipient/HealthMonitoring";

function PrivateRoute({ children }: { children: JSX.Element }) {
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
        <p className="text-gray-700 text-lg font-medium">
          Loading SilverConnect...
        </p>
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

      {/* Protected routes - requires login + shows Layout */}
      <Route
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        {/* <Route path="/journal" element={<Journal />} /> */}
        <Route path="/forum" element={<Forum />} />
        <Route path="/forumTab" element={<ForumTab />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
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

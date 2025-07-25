import "./App.css";
import Login from './pages/Login';
import Register from './pages/Register';
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import { useContext } from 'react';
import { AuthContext } from './contexts/AuthContext';
import { Navigate } from 'react-router-dom'; 
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
import Journal from "./pages/healthMonitoring/components/journal/journal";
import ResourcesAlt from "./pages/ResorucesAlt";
import HealthMonitoring from "./pages/healthMonitoring/components/add new recipient/HealthMonitoring";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useContext(AuthContext);
  if (!user) {
    // Not logged in → send to login
    return <Navigate to="/login" replace />;
  }
  return children;
}


function App() {
  return (
    <Routes>
      {/* public */}
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* everything below here requires login + shows the Layout */}
      <Route element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route path="/"         element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/journal"  element={<Journal />} />
        <Route path="/forum"    element={<Forum />} />
        <Route path="/forumTab" element={<ForumTab />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
        <Route path="/health"            element={<HealthTracking />} />
        <Route path="/resources"         element={<Resources />} />
        <Route path="/resourcesAlt"      element={<ResourcesAlt />} />
        <Route path="/settings"          element={<Settings />} />
        <Route path="/healthmonitoring"  element={<HealthMonitoring />} />

        {/* any unknown URL → send home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;

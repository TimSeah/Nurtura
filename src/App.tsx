import "./App.css";

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

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

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forumTab" element={<ForumTab />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
        <Route path="/health" element={<HealthTracking />} />
        <Route path="/care-circle" element={<CareCircle />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resourcesAlt" element={<ResourcesAlt />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/healthmonitoring" element={<HealthMonitoring />} />
      </Routes>
    </Layout>
  );
}

export default App;

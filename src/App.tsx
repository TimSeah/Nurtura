import "./App.css";

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard.tsx";
import Calendar from "./pages/calendar/calendar.tsx";
import HealthTracking from "./pages/healthMonitoring/HealthTracking.tsx";
import CareCircle from "./pages/CareCircle.tsx";
import Resources from "./pages/Resources.tsx";
import Alerts from "./pages/Alerts.tsx";
import Settings from "./pages/Settings.tsx";
import Forum from "./pages/forum/forum";
import ForumTab from "./pages/forum/ForumTab";
import ThreadDetail from "./pages/forum/threadDetail";
import Journal from "./pages/healthMonitoring/components/journal/journal.tsx";
import ResourcesAlt from "./pages/ResorucesAlt.tsx";
import HealthMonitoring from "./pages/healthMonitoring/components/add new recipient/HealthMonitoring.tsx";

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

import "./App.css";

import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard";
import Calendar from "./pages/calendar/Calendar";
import HealthTracking from "./pages/HealthTracking";
import CareCircle from "./pages/CareCircle";
import Resources from "./pages/Resources";
import Alerts from "./pages/Alerts";
import Settings from "./pages/Settings";
import Forum from "./pages/forum/Forum";
import ForumTab from './pages/forum/ForumTab';
import ThreadDetail from "./pages/forum/ThreadDetail";
import ResourcesAlt from "./pages/ResorucesAlt";

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forumTab" element={<ForumTab />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
        <Route path="/health" element={<HealthTracking />} />
        <Route path="/care-circle" element={<CareCircle />} />
        <Route path="/resources" element={<Resources />} />
        <Route path="/resourcesAlt" element={<ResourcesAlt />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;

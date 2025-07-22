import "./App.css";
import { Routes, Route } from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  SignIn,
  SignUp,
} from "@clerk/clerk-react";

import Layout from "./components/Layout";

import Dashboard from "./pages/Dashboard.tsx";
import Calendar from "./pages/calendar/calendar.tsx";
import HealthTracking from "./pages/HealthTracking.tsx";
import CareCircle from "./pages/CareCircle.tsx";
import Resources from "./pages/Resources.tsx";
import Alerts from "./pages/Alerts.tsx";
import Settings from "./pages/Settings.tsx";
import Forum from "./pages/forum/forum";
import ForumTab from "./pages/forum/ForumTab";
import ThreadDetail from "./pages/forum/threadDetail";
import Journal from "./pages/journal/journal.tsx";
import ResourcesAlt from "./pages/ResorucesAlt.tsx";

function App() {
  return (
    <Routes>
      {/* Public Clerk Authentication Pages */}
      <Route
        path="/sign-in"
        element={
          <div className="center-page">
            <SignIn />
          </div>
        }
      />
      <Route
        path="/sign-up"
        element={
          <div className="center-page">
            <SignUp />
          </div>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          <>
            <SignedIn>
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
                </Routes>
              </Layout>
            </SignedIn>

            <SignedOut>
              <RedirectToSignIn />
            </SignedOut>
          </>
        }
      />
    </Routes>
  );
}

export default App;

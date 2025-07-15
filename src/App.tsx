import "./App.css";

import { Routes, Route } from "react-router-dom";

import Calendar from "./pages/calendar/calendar";
import Home from "./pages/home";
import Forum from "./pages/forum/forum";
import ForumTab from './pages/forum/ForumTab';
import ThreadDetail from "./pages/forum/threadDetail";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/forum" element={<Forum />} />
        <Route path="/forumTab" element={<ForumTab />} />
        <Route path="/threads/:id" element={<ThreadDetail />} />
      </Routes>
    </>
  );
}

export default App;

import "./App.css";

import { Routes, Route } from "react-router-dom";

import Calendar from "./pages/calendar/calendar";
import Home from "./pages/home";
import Forum from "./pages/forum/forum";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/forum" element={<Forum />} />
      </Routes>
    </>
  );
}

export default App;

import "./App.css";

import { Routes, Route } from "react-router-dom";

import Calendar from "./pages/calendar/calendar";
import Home from "./pages/home";
import Resources from "./pages/Resources";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/resources" element={<Resources />} />
      </Routes>
    </>
  );
}

export default App;

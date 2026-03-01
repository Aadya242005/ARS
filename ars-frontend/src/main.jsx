import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import ResearchDashboard from "./pages/ResearchDashboard.jsx";
import DocSummary from "./pages/DocSummary";
import ResearchPlan from "./pages/ResearchPlan";

// 🔊 Sound system
import { SoundProvider } from "./context/SoundContext.jsx";


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/app" element={<ResearchDashboard />} />
      <Route path="/summary" element={<DocSummary />} />
      <Route path="/research" element={<ResearchPlan />} />
    </Routes>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <SoundProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </SoundProvider>
  </React.StrictMode>
);
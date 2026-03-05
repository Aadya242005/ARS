import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import ResearchDashboard from "./pages/ResearchDashboard";
import SearchResearch from "./pages/Searchresearch";
import { SoundProvider } from "./context/SoundContext";
import DocSummary from "./pages/DocSummary";
import ResearchPlan from "./pages/ResearchPlan";


function App() {
  return (
    <SoundProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/app" element={<ResearchDashboard />} />
          <Route path="/search" element={<SearchResearch />} />
          <Route path="/summary" element={<DocSummary />} />
          <Route path="/research" element={<ResearchPlan />} />
        </Routes>
      </BrowserRouter>
    </SoundProvider>
  );
}

export default App;
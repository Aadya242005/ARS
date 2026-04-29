import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from "./pages/Home";
import About from "./pages/About";
import Login from "./pages/Login";
import ResearchDashboard from "./pages/ResearchDashboard";
import SearchResearch from "./pages/Searchresearch";
import { SoundProvider } from "./context/SoundContext";
import DocSummary from "./pages/DocSummary";
import ResearchPlan from "./pages/ResearchPlan";
import ExperimentMode from "./pages/ExperimentMode";

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return null;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  // NOTE: Replace YOUR_GOOGLE_CLIENT_ID with your actual Google Client ID
  return (
    <GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
      <AuthProvider>
        <SoundProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/app" element={<PrivateRoute><ResearchDashboard /></PrivateRoute>} />
              <Route path="/search" element={<PrivateRoute><SearchResearch /></PrivateRoute>} />
              <Route path="/summary" element={<PrivateRoute><DocSummary /></PrivateRoute>} />
              <Route path="/research" element={<PrivateRoute><ResearchPlan /></PrivateRoute>} />
              <Route path="/experiment" element={<PrivateRoute><ExperimentMode /></PrivateRoute>} />
            </Routes>
          </BrowserRouter>
        </SoundProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
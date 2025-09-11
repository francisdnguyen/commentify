import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CacheProvider } from "./contexts/CacheContext";
import AuthCallback from "./components/AuthCallback";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import PlaylistDetail from "./pages/PlaylistDetail";

function App() {
  return (
    <ThemeProvider>
      <CacheProvider>
        <Router>
          <Routes>
            <Route path="/auth-callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
            <Route path="/" element={<HomePage />} />
          </Routes>
        </Router>
      </CacheProvider>
    </ThemeProvider>
  );
}

export default App;
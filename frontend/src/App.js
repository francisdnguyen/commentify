import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthCallback from "./components/AuthCallback";
import Dashboard from "./pages/Dashboard";
import HomePage from "./pages/HomePage";
import PlaylistDetail from "./pages/PlaylistDetail";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/auth-callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/playlist/:playlistId" element={<PlaylistDetail />} />
        <Route path="/" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;
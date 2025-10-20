// src/components/Layout/Navbar.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function Navbar() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <nav className="topnav">
      <div className="logo">🔥 StreakMaster</div>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/leaderboard">Leaderboard</Link>
        <Link to="/profile">Profile</Link>
        {currentUser ? (
          <button className="link-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </nav>
  );
}

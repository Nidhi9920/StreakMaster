// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";
import HabitForm from "../components/Habit/HabitForm";
import HabitList from "../components/Habit/HabitList";

export default function Dashboard() {
  const { currentUser } = useAuth();

  return (
    <div className="page">
      <h1>Welcome back{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}!</h1>
      <p className="muted">Keep your streaks going — check in every day.</p>

      <section style={{ marginTop: 20 }}>
        <HabitForm userId={currentUser.uid} />
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Your habits</h3>
        <HabitList userId={currentUser.uid} />
      </section>
    </div>
  );
}

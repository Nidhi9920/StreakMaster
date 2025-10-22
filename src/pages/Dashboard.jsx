// src/pages/Dashboard.jsx
import React from "react";
// import { useAuth } from "../context/AuthContext";
import HabitForm from "../components/Habit/HabitForm";
import HabitList from "../components/Habit/HabitList";
import useHabit from "../hooks/useHabits";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  // const { currentUser } = useAuth();
  // console.log("User:", currentUser?.email);
  const {habits, loading, error} = useHabit()
  const { currentUser } = useAuth();
  return (
    <div className="page">
      <h1>Welcome back{currentUser?.displayName ? `, ${currentUser.displayName}` : ""}!</h1>
      <p className="muted">Keep your streaks going — check in every day.</p>

      <section style={{ marginTop: 20 }}>
        <HabitForm />
      </section>

      <section style={{ marginTop: 20 }}>
        <h3>Your habits</h3>
        {loading ? (
          <p>Loading habits...</p>
        ) : habits.length === 0 ? (
          <p>No habits yet!</p>
        ) : (
          <HabitList/>
        )}
        {error && <p style={{ color: "red" }}>Error: {error.message}</p>}
      </section>
    </div>
  );
}

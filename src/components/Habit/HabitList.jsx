// src/components/Habit/HabitList.jsx
import React from "react";
import HabitCard from "./HabitCard";
import useHabit from "../../hooks/useHabits";

export default function HabitList() {
  const { habits, loading } = useHabit(); // no need for userId prop

  if (loading) return <div className="page">Loading habits...</div>;

  if (!habits || habits.length === 0) {
    return (
      <div className="page">
        <p className="muted">
          No habits yet. Add your first habit to start building a streak!
        </p>
      </div>
    );
  }

  return (
    <div className="habit-list">
      {habits.map((h) => (
        <HabitCard key={h.id} habit={h} />
      ))}
    </div>
  );
}

// src/components/Habit/HabitForm.jsx
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import useHabit from "../../hooks/useHabits";

export default function HabitForm() {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { currentUser } = useAuth();
  const { addHabit } = useHabit();
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Please enter a habit title.");
      return;
    }
    // console.log("User details who is logged in: ", currentUser?.uid);
    if(!currentUser?.uid){
      setError("User not logged in yet.")
      return;
    }
    setSaving(true);
    try {
      await addHabit({ userId: currentUser?.uid, title: title.trim(), note: note.trim() });
      setTitle("");
      setNote("");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to create habit");
    }
    setSaving(false);
  }

  return (
    <form className="habit-form card" onSubmit={handleSubmit}>
      <h3>Create a new habit</h3>
      {error && <div className="error">{error}</div>}
      <input
        placeholder="Habit title (e.g., 'Meditate 10 min')"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        placeholder="Optional note"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button className="btn" disabled={saving} type="submit">
        {saving ? "Saving..." : "Add Habit"}
      </button>
    </form>
  );
}

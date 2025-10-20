// src/components/Habit/HabitForm.jsx
import React, { useState } from "react";
import { createHabit } from "../../services/habits";

export default function HabitForm({ userId }) {
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!title.trim()) {
      setError("Please enter a habit title.");
      return;
    }
    setSaving(true);
    try {
      await createHabit({ userId, title: title.trim(), note: note.trim() });
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

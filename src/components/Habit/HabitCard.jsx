import React, { useState, useEffect } from "react";
import { checkInHabit, deleteHabit } from "../../services/habits";
import { useAuth } from "../../context/AuthContext";
import { todayISO } from "../../utils/dateUtil";
import confetti from "canvas-confetti";
import { getUnlockedBadge } from "../../utils/badges";

export default function HabitCard({ habit }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [localHabit, setLocalHabit] = useState(habit);
  const [badge, setBadge] = useState(null);
  const [animateStreak, setAnimateStreak] = useState(false);

  // Animate streak whenever currentStreak changes
  useEffect(() => {
    if (localHabit.currentStreak > 0) {
      setAnimateStreak(true);
      const timeout = setTimeout(() => setAnimateStreak(false), 600);
      return () => clearTimeout(timeout);
    }
  }, [localHabit.currentStreak]);

  async function handleCheckIn() {
    setLoading(true);
    try {
      const res = await checkInHabit(localHabit.id, currentUser.uid, currentUser.displayName);

      if (res.status === "checked") {
        const updatedHabit = {
          ...localHabit,
          currentStreak: res.habit.currentStreak,
          longestStreak: res.habit.longestStreak,
          lastCheckIn: res.habit.lastCheckIn,
          checkins: {
            ...(localHabit.checkins || {}),
            [res.habit.lastCheckIn]: true
          }
        };

        setLocalHabit(updatedHabit);

        // 🎖 Check for badge unlock
        const unlocked = getUnlockedBadge(updatedHabit.currentStreak);
        if (unlocked) {
          setBadge(unlocked);
          launchConfetti();
          setTimeout(() => setBadge(null), 5000);
        }
      } else if (res.status === "already_checked") {
        console.log("Already checked today.");
      }
    } catch (err) {
      console.error("Check-in failed:", err);
      alert(err.message || "Check-in failed");
    }
    setLoading(false);
  }

  function launchConfetti() {
    confetti({
      particleCount: 180,
      spread: 70,
      origin: { y: 0.6 },
      gravity: 0.5,
      ticks: 200,
      colors: ["#ff0a54", "#ff477e", "#ff7096", "#ff85a1", "#fbb1b1"]
    });
  }

  async function handleDelete() {
    if (!confirm("Delete this habit?")) return;
    try {
      await deleteHabit(localHabit.id);
    } catch (err) {
      console.error(err);
    }
  }

  const checkedToday = localHabit.checkins && localHabit.checkins[todayISO()];

  return (
    <div className="habit-card card">
      <div className="habit-left">
        <h4 className="habit-title">{localHabit.title}</h4>
        {localHabit.note && <p className="muted">{localHabit.note}</p>}

        {/* 🔥 Animated Streaks */}
        <div className="streaks">
          <span
            className={`current-streak ${animateStreak ? "pulse" : ""}`}
          >
            🔥 <strong>{localHabit.currentStreak || 0}</strong> day
            {localHabit.currentStreak > 1 ? "s" : ""} streak
          </span>
          <span className="longest-streak">
            🏆 Longest: <strong>{localHabit.longestStreak || 0}</strong>
          </span>
        </div>
      </div>

      <div className="habit-right">
        <button
          className={`btn checkin ${checkedToday ? "checked" : ""}`}
          onClick={handleCheckIn}
          disabled={loading || checkedToday}
        >
          {checkedToday ? "Checked" : loading ? "Checking..." : "Check In"}
        </button>

        <button className="link-btn small" onClick={handleDelete}>
          Delete
        </button>
      </div>

      {/* 🏅 Badge Popup */}
      {badge && (
        <div className="badge-popup" style={{ borderColor: badge.color }}>
          🏅 <strong>{badge.name}</strong> Unlocked!
        </div>
      )}
    </div>
  );
}

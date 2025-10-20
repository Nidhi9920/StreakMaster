// src/pages/Leaderboard.jsx
import React from "react";
import useLeaderboard from "../hooks/useLeaderBoard";

export default function Leaderboard() {
  const { leaders, loading } = useLeaderboard(10);

  if (loading) return <div className="page">Loading leaderboard...</div>;

  if (!leaders.length)
    return <div className="page">No data yet. Be the first to start a streak!</div>;

  return (
    <div className="page">
      <h1>🔥 Leaderboard</h1>
      <p className="muted">Top users by longest active streak</p>

      <table className="leaderboard-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Name</th>
            <th>Highest Streak</th>
          </tr>
        </thead>
        <tbody>
          {leaders.map((u, idx) => (
            <tr key={u.userId}>
              <td>{idx + 1}</td>
              <td>{u.displayName || "Anonymous"}</td>
              <td>{u.highestStreak}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

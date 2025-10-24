import React, { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "userStats"),
      orderBy("highestStreak", "desc"),
      limit(20)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsers(list);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  if (loading) return <div className="page">Loading leaderboard...</div>;

  return (
    <div className="leaderboard page">
      <h2>🏆 Leaderboard</h2>
      {users.length === 0 ? (
        <p className="muted">No streaks yet! Start checking in to appear here.</p>
      ) : (
        <div className="leaderboard-list">
          {users.map((u, index) => {
            let rankClass = "";
            if (index === 0) rankClass = "gold";
            else if (index === 1) rankClass = "silver";
            else if (index === 2) rankClass = "bronze";

            return (
              <div key={u.id} className={`leaderboard-item ${rankClass}`}>
                <div className="rank">#{index + 1}</div>
                <div className="user-info">
                  <div className="name">{u.displayName || "Anonymous"}</div>
                  <div className="streak">🔥 {u.highestStreak || 0} days</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

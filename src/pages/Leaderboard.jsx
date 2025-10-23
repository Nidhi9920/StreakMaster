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
    <div className="page">
      <h2 className="page-title">🏆 Leaderboard</h2>
      {users.length === 0 ? (
        <p className="muted">No streaks yet! Start checking in to appear here.</p>
      ) : (
        <div className="leaderboard">
          {users.map((u, i) => (
            <div key={u.id} className="leaderboard-item card">
              <span className="rank">{i + 1}</span>
              <div className="user-info">
                <strong>{u.displayName || "Anonymous"}</strong>
              </div>
              <span className="streak">🔥 {u.highestStreak || 0}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

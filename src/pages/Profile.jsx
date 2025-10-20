import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../services/firebase";

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user stats (highest streak, total habits)
  useEffect(() => {
    if (!currentUser) return;

    const fetchStats = async () => {
      try {
        setLoading(true);
        const statsRef = doc(db, "userStats", currentUser.uid);
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          setUserStats(statsSnap.data());
        } else {
          setUserStats({ highestStreak: 0 });
        }
      } catch (err) {
        console.error(err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser]);

  if (!currentUser) {
    return <p>Please log in to view your profile.</p>;
  }

  return (
    <div className="profile-page">
      <h2>Profile</h2>

      <div className="profile-card card">
        <p>
          <strong>Name:</strong> {currentUser.displayName || "Anonymous"}
        </p>
        <p>
          <strong>Email:</strong> {currentUser.email}
        </p>
        {loading ? (
          <p>Loading stats...</p>
        ) : error ? (
          <p>Error loading stats</p>
        ) : (
          <div className="stats">
            <p>
              <strong>Highest Streak:</strong>{" "}
              {userStats?.highestStreak || 0} 🔥
            </p>
          </div>
        )}

        <button className="btn logout" onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

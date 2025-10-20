// src/hooks/useLeaderboard.js
import { useEffect, useState } from "react";
import { collection, query, orderBy, limit, onSnapshot } from "firebase/firestore";
import { db } from "../services/firebase";

export default function useLeaderboard(limitCount = 10) {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, "userStats"),
      orderBy("highestStreak", "desc"),
      limit(limitCount)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => doc.data());
      setLeaders(data);
      setLoading(false);
    });

    return () => unsub();
  }, [limitCount]);

  return { leaders, loading };
}

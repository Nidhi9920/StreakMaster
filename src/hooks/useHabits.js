import { useEffect, useState, useCallback } from "react";
import {
  subscribeHabits,
  createHabit,
  checkInHabit,
  deleteHabit,
  editHabit,
} from "../services/habits";
import { useAuth } from "../context/AuthContext";

export default function useHabit() {
  const { currentUser } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Real-time subscription to habits
  useEffect(() => {
    if (!currentUser) return;

    setLoading(true);
    const unsubscribe = subscribeHabits(
      currentUser.uid,
      (data) => {
        setHabits(data);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [currentUser]);

  // Create a new habit
  const addHabit = useCallback(
    async (habitData) => {
      if (!currentUser) return;
      try {
        const habitId = await createHabit({
          ...habitData,
          userId: currentUser.uid,
        });
        return habitId;
      } catch (err) {
        setError(err);
      }
    },
    [currentUser]
  );

  // Check-in for a habit
  const checkIn = useCallback(
    async (habitId) => {
      if (!currentUser) return;
      try {
        const res = await checkInHabit(
          habitId,
          currentUser.uid,
          currentUser.displayName
        );
        return res;
      } catch (err) {
        setError(err);
      }
    },
    [currentUser]
  );

  // Delete a habit
  const removeHabit = useCallback(
    async (habitId) => {
      try {
        await deleteHabit(habitId);
      } catch (err) {
        setError(err);
      }
    },
    []
  );

  // Edit a habit
  const updateHabit = useCallback(async (habitId, updates) => {
    try {
      await editHabit(habitId, updates);
    } catch (err) {
      setError(err);
    }
  }, []);

  return {
    habits,
    loading,
    error,
    addHabit,
    checkIn,
    removeHabit,
    updateHabit,
  };
}

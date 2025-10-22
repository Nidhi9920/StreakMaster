// src/services/habits.js
import {
    collection,
    query,
    where,
    // orderBy,
    onSnapshot,
    addDoc,
    serverTimestamp,
    doc,
    // getDoc,
    updateDoc,
    deleteDoc,
    runTransaction,
    // setDoc
  } from "firebase/firestore";
  import { db } from "./firebase";
  import { todayISO, isConsecutive } from "../utils/dateUtil";
  
  /**
   * Real-time subscription to habits for a user.
   */
  export function subscribeHabits(userId, onUpdate, onError) {
    if (!userId) {
      console.warn("subscribeHabits called without a valid userId");
      return;
    }
  
    const q = query(collection(db, "habits"), where("userId", "==", userId));
  
    return onSnapshot(
      q,
      (snapshot) => {
        const habits = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        onUpdate(habits);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        if (onError) onError(err);
      }
    );
  }
  
  
  /**
   * Create a new habit.
   */
  export async function createHabit({ userId, title, note = "", goalType = "daily" }) {
    const payload = {
      userId,
      title,
      note,
      goalType,
      createdAt: serverTimestamp(),
      currentStreak: 0,
      longestStreak: 0,
      lastCheckIn: null,
      checkins: {}
    };
    const colRef = collection(db, "habits");
    const docRef = await addDoc(colRef, payload);
    return docRef.id;
  }
  
  /**
   * Delete a habit.
   */
  export async function deleteHabit(habitId) {
    await deleteDoc(doc(db, "habits", habitId));
  }
  
  /**
   * Check-in logic for a habit.
   * Updates habit streaks and userStats for leaderboard.
   */
  export async function checkInHabit(habitId, userId, userDisplayName = "Anonymous") {
    const today = todayISO();
    const habitRef = doc(db, "habits", habitId);
  
    return await runTransaction(db, async (transaction) => {
      const habitSnap = await transaction.get(habitRef);
      if (!habitSnap.exists()) throw new Error("Habit does not exist");
  
      const habit = habitSnap.data();
  
      // Security: ensure userId matches
      if (habit.userId !== userId) throw new Error("Unauthorized");
  
      // Already checked today?
      if (habit.checkins && habit.checkins[today]) {
        return { status: "already_checked", habit: { id: habitId, ...habit } };
      }
  
      const prevDate = habit.lastCheckIn || null;
  
      // Calculate new streak
      let newStreak = 1;
      if (isConsecutive(prevDate, today)) {
        newStreak = (habit.currentStreak || 0) + 1;
      }
  
      const newLongest = Math.max(habit.longestStreak || 0, newStreak);
  
      // Update habit
      const updatedData = {
        currentStreak: newStreak,
        longestStreak: newLongest,
        lastCheckIn: today,
        [`checkins.${today}`]: true
      };
  
      transaction.update(habitRef, updatedData);
  
      // --- Update userStats for Leaderboard ---
      const userStatsRef = doc(db, "userStats", userId);
  
      transaction.set(
        userStatsRef,
        {
          userId,
          displayName: userDisplayName || "Anonymous",
          highestStreak: Math.max(newStreak, habit.userHighestStreak || 0),
          updatedAt: serverTimestamp()
        },
        { merge: true }
      );
  
      return {
        status: "checked",
        habit: {
          id: habitId,
          ...habit,
          ...updatedData
        }
      };
    });
  }
  
  /**
   * Edit habit (title/note)
   */
  export async function editHabit(habitId, { title, note }) {
    const ref = doc(db, "habits", habitId);
    const payload = {};
    if (title !== undefined) payload.title = title;
    if (note !== undefined) payload.note = note;
    await updateDoc(ref, payload);
  }
  
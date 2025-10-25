/* eslint-disable no-unused-vars */
// src/pages/Profile.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../services/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc
} from "firebase/firestore";
import { signOut, updateProfile } from "firebase/auth";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { subDays, format } from "date-fns";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";

export default function Profile() {
  const { currentUser } = useAuth();
  const [stats, setStats] = useState({ totalHabits: 0, currentStreak: 0, highestStreak: 0 });
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [photoURL, setPhotoURL] = useState("");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState(null);
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

 

  useEffect(() => {
    async function fetchStats() {
      if (!currentUser) return;
      try {
        const q = query(collection(db, "habits"), where("userId", "==", currentUser.uid));
        const querySnapshot = await getDocs(q);
        const totalHabits = querySnapshot.size;

        const statDoc = await getDoc(doc(db, "userStats", currentUser.uid));
        const data = statDoc.exists() ? statDoc.data() : {};
        if(data.photoURL) setPhotoURL(data.photoURL);
        const highestStreak = data.highestStreak || 0;

        let currentStreak = 0;
        let allCheckins = [];

        querySnapshot.forEach((doc) => {
          const habit = doc.data();
          currentStreak += habit.currentStreak || 0;
          if (habit.checkins) {
            allCheckins.push(...Object.keys(habit.checkins));
          }
        });

        setStats({ totalHabits, currentStreak, highestStreak });

        // Weekly data (past 7 days)
        const today = new Date();
        const last7Days = Array.from({ length: 7 }).map((_, i) => {
          const d = subDays(today, 6 - i);
          const dateStr = format(d, "yyyy-MM-dd");
          const count = allCheckins.filter((c) => c === dateStr).length;
          return { day: format(d, "EEE"), checkins: count };
        });

        setChartData(last7Days);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [currentUser]);

  // Convert file to base64 string
  const toBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

  async function handleFileChange(e) {
    const selected = e.target.files[0];
    if (!selected) return;
    setFile(selected);

    try {
      setUploading(true);
      const base64 = await toBase64(selected);
      // update Firebase Auth user + Firestore
      await updateDoc(doc(db, "userStats", currentUser.uid), { photoURL: base64 });
      setPhotoURL(base64);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    try {
      await updateProfile(auth.currentUser, { displayName });
      await updateDoc(doc(db, "userStats", currentUser.uid), { displayName });
      alert("Profile updated!");
      setEditing(false);
    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  }

  async function handleLogout() {
    await signOut(auth);
  }
   // Handle password change
  async function handlePasswordChange(e) {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      // Re-authenticate user
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      // Update password
      await updatePassword(currentUser, newPassword);
      setPasswordSuccess("Password updated successfully!");
      alert("Password changed successfully!")
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setEditing(false);
    } catch (err) {
      console.error(err);
      setPasswordError(err.message || "Failed to update password.");
    } finally {
      setChangingPassword(false);
    }
  }

  if (loading) return <div className="page">Loading profile...</div>;

  return (
    <div className="profile page">
      <h2>👤 Your Profile</h2>

      <div className="profile-card card">
        <div className="profile-header">
          <img
            src={photoURL || "https://i.pravatar.cc/150"}
            alt="Profile"
            className="profile-photo"
          />
          <label className="upload-btn">
            {uploading ? "Uploading..." : "Upload Photo"}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
              disabled={uploading}
            />
          </label>
          <div className="profile-info"> 
            {editing ? (
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
                className="input-field"
              />
            ) : (
              <h3>{displayName || "Anonymous"}</h3>
            )}
            <p>{currentUser.email}</p>
          </div>
        </div>

        <div className="profile-stats">
          <div className="stat">
            <span>{stats.totalHabits}</span>
            <label>Total Habits</label>
          </div>
          <div className="stat">
            <span>🔥 {stats.currentStreak}</span>
            <label>Current Total Streak</label>
          </div>
          <div className="stat">
            <span>🏆 {stats.highestStreak}</span>
            <label>Highest Streak</label>
          </div>
        </div>

        <div className="chart-container">
          <h4>📊 Weekly Check-ins</h4>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
            >
              {/* Gradient Definition */}
              <defs>
                <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff8a65" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#ff7043" stopOpacity={0.6} />
                </linearGradient>
              </defs>

              {/* Grid */}
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#444" />

              {/* Axes */}
              <XAxis dataKey="day" tick={{ fill: "#fff", fontWeight: "bold" }} />
              <YAxis
                allowDecimals={false}
                tick={{ fill: "#fff", fontWeight: "bold" }}
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{ backgroundColor: "#222", border: "none", borderRadius: 8 }}
                itemStyle={{ color: "#fff" }}
                cursor={{ fill: "rgba(255,255,255,0.1)" }}
                formatter={(value) => [`${value} check-in${value > 1 ? "s" : ""}`, ""]}
              />

              {/* Animated Neon Bars */}
              <Bar
                dataKey="checkins"
                fill="url(#neonGrad)"
                radius={[6, 6, 0, 0]}
                barSize={26}
                animationDuration={800}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>

        </div>
        <div className="profile-actions">
          {editing ? (
            <>
              <button className="btn" onClick={handleSave}>
                Save Changes
              </button>
              <button className="btn secondary" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </>
          ) : (
            <button className="btn" onClick={() => setEditing(true)}>
              Edit Profile
            </button>
          )}
          <button className="btn danger" onClick={handleLogout}>
            Logout
          </button>
        </div>
         {/* Change Password Section */}
         {editing && (
            <div className="change-password card" style={{ marginTop: 20 }}>
              <h3>🔒 Change Password</h3>
              {passwordError && <div className="error">{passwordError}</div>}
              {passwordSuccess && <div className="success">{passwordSuccess}</div>}
              <form onSubmit={handlePasswordChange}>
                <input
                  type="password"
                  className="input-field"
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="input-field"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <input
                  type="password"
                  className="input-field"
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button className="btn" type="submit" disabled={changingPassword}>
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            </div>
          )}

      </div>
    </div>
  );
}

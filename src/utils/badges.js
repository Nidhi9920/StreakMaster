// src/utils/badges.js
export const BADGE_MILESTONES = [
    { days: 7, name: "1-Week Streak", color: "#FFD700" },
    { days: 14, name: "2-Week Streak", color: "#C0C0C0" },
    { days: 30, name: "1-Month Streak", color: "#FF8C00" },
    { days: 50, name: "50-Day Streak", color: "#00CED1" },
    { days: 100, name: "100-Day Streak", color: "#FF1493" }
  ];
  
  export function getUnlockedBadge(streak) {
    // Returns badge object if streak reaches milestone
    return BADGE_MILESTONES
      .slice()
      .reverse()
      .find((b) => streak === b.days);
  }
  
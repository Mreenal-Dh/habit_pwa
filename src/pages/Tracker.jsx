import { useEffect, useState, useContext } from "react";
import {
  doc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../firebase";
import { HabitContext } from "../context/HabitContext";
import { useAuth } from "../auth/AuthContext";

export default function Tracker({ selectedGoal, setSelectedGoal }) {
  const [tasks, setTasks] = useState([]);
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const [showStreakDialog, setShowStreakDialog] = useState(false);
  const { goals, habits, logs, loading: dataLoading, refreshLogs, updateLogInCache } = useContext(HabitContext);
  const { user } = useAuth();

  // Check if animation should play (only once per app session, not per page load)
  useEffect(() => {
    const hasAnimated = localStorage.getItem('streakAnimated');
    if (!hasAnimated) {
      setShouldAnimate(true);
      localStorage.setItem('streakAnimated', 'true');
    }
  }, []);

  // Today helpers
  const todayDate = new Date().toISOString().split("T")[0];
  const todayDay = new Date().toLocaleDateString("en-US", {
    weekday: "short",
  });

  // Filter goals for today and auto-select if none selected
  useEffect(() => {
    if (!dataLoading && goals.length > 0 && !selectedGoal) {
      const todayGoals = goals.filter(g => g.days?.includes(todayDay));
      if (todayGoals.length > 0) {
        setSelectedGoal(todayGoals[0]);
      }
      setLoading(false);
    } else if (!dataLoading && goals.length === 0) {
      setLoading(false);
    } else if (!dataLoading) {
      setLoading(false);
    }
  }, [dataLoading, goals, todayDay, selectedGoal, setSelectedGoal]);

  // Load tasks when goal selected
  useEffect(() => {
    if (selectedGoal && habits.length > 0) {
      // Re-sync selectedGoal with latest goals data to get updated quote
      const updatedGoal = goals.find(g => g.id === selectedGoal.id);
      if (updatedGoal) {
        setSelectedGoal(updatedGoal);
      }
      
      const goalHabits = habits.filter(h => h.goalId === selectedGoal.id);
      
      const logsMap = {};
      logs.forEach(log => {
        if (log.date === todayDate) {
          logsMap[log.habitId] = log.completed;
        }
      });

      const finalTasks = goalHabits.map(habit => ({
        ...habit,
        completed: logsMap[habit.id] || false,
      }));

      setTasks(finalTasks);

      // Compute streak when goal, habits, or logs change
      setStreak(computeGoalStreak(updatedGoal || selectedGoal, goalHabits, logs));
    }
  }, [selectedGoal, habits, logs, todayDate, goals]);

  async function toggleHabit(habit) {
    const logRef = doc(
      db,
      "habit_logs",
      `${habit.id}_${todayDate}`
    );

    const newCompleted = !habit.completed;

    // Update cache immediately (this will trigger useEffect to rebuild tasks)
    updateLogInCache(habit.id, todayDate, newCompleted, habit.goalId);

    // Write to Firestore in background
    try {
      await setDoc(logRef, {
        habitId: habit.id,
        goalId: habit.goalId,
        date: todayDate,
        completed: newCompleted,
        userId: user.uid,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error toggling habit:", error);
      // Revert cache on error
      updateLogInCache(habit.id, todayDate, !newCompleted, habit.goalId);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (goals.length === 0) {
    return (
      <div className="page" style={{ textAlign: "center" }}>
        <h1>
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
          })}
        </h1>
        <p>No goals scheduled for today.</p>
        <p>Create a goal and make sure to select {todayDay} as an active day!</p>
      </div>
    );
  }

  return (
    <div className="page" style={{ position: "relative" }}>
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
      }}>
        <div 
          className="streak-badge" 
          onClick={() => setShowStreakDialog(true)}
          style={{ cursor: 'pointer' }}
        >
          <div className={`streak-fire-image ${shouldAnimate ? 'animate' : ''}`} aria-hidden="true"></div>
          <span className="streak-number">{streak}</span>
        </div>
      </div>

      {showStreakDialog && (
        <div className="streak-dialog-overlay" onClick={() => setShowStreakDialog(false)}>
          <div className="streak-dialog" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 16px 0", fontSize: "24px", color: "#333" }}>Keep Going! 🔥</h2>
            <p style={{ fontSize: "18px", margin: "0 0 24px 0", color: "#666" }}>
              You're on a <strong style={{ color: "#4caf50" }}>{streak} day{streak === 1 ? "" : "s"}</strong> streak!
            </p>
            <button
              onClick={() => setShowStreakDialog(false)}
              style={{
                padding: "10px 24px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}

      <h1 className="mb-md">
        {new Date().toLocaleDateString("en-US", {
          weekday: "long",
        })}
      </h1>

      <blockquote style={{
        fontStyle: "italic",
        color: "var(--text-secondary)",
        fontSize: "14px",
        margin: "0 0 24px 0",
        padding: "0 0 0 16px",
        borderLeft: "3px solid var(--border-light)",
      }}>
        "{selectedGoal?.quote || "Now I am become Death, the destroyer of worlds"}"
      </blockquote>

      {tasks.length === 0 ? (
        <p>No tasks for today.</p>
      ) : (
        <>
          <ul className="task-list">
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`task-item ${task.completed ? "completed" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleHabit(task)}
                />
                <span className="task-title">
                  {task.title}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// Calculate consecutive scheduled-day streak where all goal habits are complete
function computeGoalStreak(goal, goalHabits, allLogs) {
  if (!goal || !Array.isArray(goalHabits) || goalHabits.length === 0) return 0;
  const scheduledDays = goal.days || [];
  if (scheduledDays.length === 0) return 0;

  // Build quick lookup: completionByDate[date][habitId] = completed
  const completionByDate = {};
  allLogs.forEach(log => {
    if (log.goalId === goal.id && log.date) {
      if (!completionByDate[log.date]) completionByDate[log.date] = {};
      completionByDate[log.date][log.habitId] = log.completed === true;
    }
  });

  const today = new Date();
  const startRef = getGoalStartDate(goal, today);
  const lookbackLimit = new Date();
  lookbackLimit.setDate(today.getDate() - 200); // limit for perf
  const boundary = startRef > lookbackLimit ? startRef : lookbackLimit;

  let streak = 0;
  for (let cursor = new Date(today); cursor >= boundary; cursor.setDate(cursor.getDate() - 1)) {
    const iso = cursor.toISOString().split("T")[0];
    const weekday = cursor.toLocaleDateString("en-US", { weekday: "short" });

    if (!scheduledDays.includes(weekday)) {
      continue; // not scheduled, ignore
    }

    const dateMap = completionByDate[iso] || {};
    const allDone = goalHabits.every(h => dateMap[h.id]);

    if (allDone) {
      streak += 1;
    } else {
      break; // stop when first scheduled day is incomplete
    }
  }

  return streak;
}

function getGoalStartDate(goal, fallbackDate) {
  const toDate = (value) => {
    if (!value) return null;
    if (value.toDate) return value.toDate(); // Firestore Timestamp
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const start = toDate(goal.startDate);
  const created = toDate(goal.createdAt);
  return start || created || fallbackDate;
}

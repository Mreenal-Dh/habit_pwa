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
  const { goals, habits, logs, loading: dataLoading, updateLogInCache } = useContext(HabitContext);
  const { user } = useAuth();

  // Daily task state
  const [dailyTasks, setDailyTasks] = useState([]);
  const [showDailyTaskModal, setShowDailyTaskModal] = useState(false);
  const [dailyTaskInput, setDailyTaskInput] = useState("");

  // Check if animation should play (only once per app session, not per page load)
  useEffect(() => {
    const hasAnimated = localStorage.getItem('streakAnimated');
    if (!hasAnimated) {
      setShouldAnimate(true);
      localStorage.setItem('streakAnimated', 'true');
    }
  }, []);

  // Auto-clear daily tasks at 5AM
  useEffect(() => {
    const checkAndClearDailyTask = () => {
      const now = new Date();
      const lastClearDate = localStorage.getItem('lastDailyTaskClearDate');
      const todayDate = new Date().toISOString().split("T")[0];
      
      // Check if it's past 5AM and we haven't cleared today
      if (now.getHours() >= 5 && lastClearDate !== todayDate) {
        setDailyTasks([]);
        localStorage.removeItem('dailyTasks');
        localStorage.setItem('lastDailyTaskClearDate', todayDate);
      }
    };

    // Load daily tasks from localStorage on mount
    const savedDailyTasks = localStorage.getItem('dailyTasks');
    if (savedDailyTasks) {
      try {
        const parsedTasks = JSON.parse(savedDailyTasks);
        if (Array.isArray(parsedTasks)) {
          setDailyTasks(parsedTasks);
        }
      } catch (error) {
        console.error("Error parsing saved daily tasks:", error);
      }
    }

    checkAndClearDailyTask();

    // Check every minute if we should clear
    const interval = setInterval(checkAndClearDailyTask, 60000);
    return () => clearInterval(interval);
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
    }
    // If selectedGoal was deleted, select a new one
    if (!dataLoading && selectedGoal && !goals.find(g => g.id === selectedGoal.id)) {
      const todayGoals = goals.filter(g => g.days?.includes(todayDay));
      if (todayGoals.length > 0) {
        setSelectedGoal(todayGoals[0]);
      } else if (goals.length > 0) {
        setSelectedGoal(goals[0]);
      } else {
        setSelectedGoal(null);
      }
    }
    if (!dataLoading) {
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
      setStreak(computeGoalStreak(updatedGoal || selectedGoal, goalHabits, logs));
    }
  }, [selectedGoal, habits, logs, todayDate, goals, setSelectedGoal]);

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

  // Handle adding daily task
  const handleAddDailyTask = () => {
    if (dailyTaskInput.trim()) {
      const newTask = {
        id: `daily-${Date.now()}`,
        title: dailyTaskInput.trim(),
        completed: false,
      };

      const updatedTasks = [...dailyTasks, newTask];
      setDailyTasks(updatedTasks);
      localStorage.setItem('dailyTasks', JSON.stringify(updatedTasks));
      setDailyTaskInput("");
      setShowDailyTaskModal(false);
    }
  };

  const toggleDailyTask = (taskId) => {
    const updatedTasks = dailyTasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setDailyTasks(updatedTasks);
    localStorage.setItem('dailyTasks', JSON.stringify(updatedTasks));
  };

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
    <>
      <div className="page" style={{ position: "relative" }}>
        <div className="streak-wrapper">
          <button
            className="streak-badge"
            onClick={() => setShowStreakDialog(true)}
            aria-label={`Open streak dialog, ${streak} day streak`}
          >
            <span className={`streak-icon ${shouldAnimate ? 'animate' : ''}`} aria-hidden="true">🔥</span>
            <span className="streak-text">
              <span className="streak-count">{streak}</span>
              <span className="streak-label">day streak</span>
            </span>
          </button>
        </div>

        {showStreakDialog && (
          <div className="streak-dialog-overlay" onClick={() => setShowStreakDialog(false)}>
            <div className="streak-dialog" onClick={(e) => e.stopPropagation()}>
              <h2 style={{ margin: "0 0 16px 0", fontSize: "24px", color: "var(--text-primary)" }}>Keep Going! 🔥</h2>
              <p style={{ fontSize: "18px", margin: "0 0 24px 0", color: "var(--text-secondary)" }}>
                You're on a <strong style={{ color: "var(--accent)" }}>{streak} day{streak === 1 ? "" : "s"}</strong> streak!
              </p>
              <button
                onClick={() => setShowStreakDialog(false)}
                style={{
                  padding: "10px 24px",
                  backgroundColor: "var(--accent)",
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

        {/* Daily task box */}
        {dailyTasks.length > 0 && (
          <div className="daily-task-box">
            <h4 className="daily-task-subheading">Today's</h4>
            <ul className="task-list">
              {dailyTasks.map((task) => (
                <li
                  key={task.id}
                  className={`task-item ${task.completed ? "completed" : ""}`}
                >
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleDailyTask(task.id)}
                  />
                  <span className="task-title">{task.title}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

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

        {/* Plus button */}
        <button
          className="add-daily-task-button"
          onClick={() => setShowDailyTaskModal(true)}
          aria-label="Add daily task"
        >
          +
        </button>

        {/* Daily task modal */}
        {showDailyTaskModal && (
          <div className="daily-task-modal-overlay" onClick={() => setShowDailyTaskModal(false)}>
            <div className="daily-task-modal" onClick={(e) => e.stopPropagation()}>
              <h2 className="daily-task-modal-heading">Today's work</h2>
              <input
                type="text"
                className="daily-task-input"
                placeholder="Enter your today's task"
                value={dailyTaskInput}
                onChange={(e) => setDailyTaskInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleAddDailyTask();
                  }
                }}
                autoFocus
              />
              <div className="daily-task-modal-buttons">
                <button
                  className="daily-task-cancel-btn"
                  onClick={() => setShowDailyTaskModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="daily-task-add-btn"
                  onClick={handleAddDailyTask}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
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
    const allDone = goalHabits.every(h => dateMap[h.id] === true);

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

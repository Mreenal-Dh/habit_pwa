import { useMemo, useContext } from "react";
import { HabitContext } from "../context/HabitContext";

export default function DayDetails({ goalId, date, setScreen, onClose }) {
  const { goals, habits, logs } = useContext(HabitContext);

  const goal = goals.find(g => g.id === goalId);

  const getGoalStartDate = (goalData) => {
    if (!goalData) return null;
    const source = goalData.startDate || goalData.createdAt;
    if (!source) return null;
    if (typeof source.toDate === "function") return source.toDate();
    if (source.seconds) return new Date(source.seconds * 1000);
    const parsed = new Date(source);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const startDate = getGoalStartDate(goal);
  const startISO = startDate ? startDate.toISOString().split("T")[0] : null;
  const todayISO = new Date().toISOString().split("T")[0];
  const isPast = date < todayISO;
  const beforeStart = startISO ? date < startISO : false;

  const tasks = useMemo(() => {
    if (!goal) return [];
    const goalHabits = habits.filter(h => h.goalId === goalId);
    const map = {};
    logs.forEach(log => {
      if (log.goalId === goalId && log.date === date) {
        map[log.habitId] = log.completed === true;
      }
    });
    return goalHabits.map(h => ({ ...h, completed: map[h.id] || false }));
  }, [goal, goalId, habits, logs, date]);

  if (!goal) {
    return (
      <div className="page">
        <h1 className="mb-md">Day Details</h1>
        <p>Goal not found.</p>
        <button
          onClick={() => (onClose ? onClose() : setScreen?.({ name: "goals" }))}
          style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #ccc", background: "white", cursor: "pointer" }}
        >
          Back
        </button>
      </div>
    );
  }

  const displayDate = new Date(date).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  if (beforeStart) {
    return (
      <div className="page">
        <h1 className="mb-md">Day Details</h1>
        <p>Goal was not set for this date.</p>
        <button
          onClick={() => (onClose ? onClose() : setScreen?.({ name: "goals" }))}
          style={{ padding: "10px 16px", borderRadius: "8px", border: "1px solid #ccc", background: "white", cursor: "pointer" }}
        >
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="mb-xs">{goal.title}</h1>
      <p className="mb-md" style={{ color: "#666" }}>{displayDate}</p>

      {tasks.length === 0 ? (
        <p>No tasks for this day.</p>
      ) : (
        <ul className="task-list">
          {tasks.map(task => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? "completed" : ""}`}
              style={{ cursor: "default", display: "flex", alignItems: "center", gap: "8px" }}
            >
              {(task.completed || isPast) && (
                <span style={{ width: "20px", display: "inline-block", textAlign: "center", fontWeight: 700 }}>
                  {task.completed ? "✓" : "✗"}
                </span>
              )}
              <span className="task-title">{task.title}</span>
            </li>
          ))}
        </ul>
      )}

      <div style={{ marginTop: "24px" }}>
        <button
          onClick={() => (onClose ? onClose() : setScreen?.({ name: "goals" }))}
          style={{
            padding: "10px 18px",
            backgroundColor: "#4caf50",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Back to Goals
        </button>
      </div>
    </div>
  );
}

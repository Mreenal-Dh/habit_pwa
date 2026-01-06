import { useEffect, useState, useContext } from "react";
import { HabitContext } from "../context/HabitContext";

export default function MatrixCalendar({ goal, onDateSelect }) {
  const [habits, setHabits] = useState([]);
  const [logsMap, setLogsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const { habits: allHabits, logs: allLogs } = useContext(HabitContext);

  // Get current month date range (ISO strings)
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const dateRange = generateDateRange(firstDay, lastDay);

  function generateDateRange(start, end) {
    const dates = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split("T")[0]);
    }
    return dates;
  }

  useEffect(() => {
    if (goal?.id && allHabits.length > 0 && allLogs.length >= 0) {
      loadCalendarData();
    }
  }, [goal?.id, allHabits, allLogs]);

  function loadCalendarData() {
    setLoading(true);

    // 1️⃣ Filter habits for this goal
    const habitsList = allHabits.filter(h => h.goalId === goal.id);
    setHabits(habitsList);

    if (habitsList.length === 0) {
      setLoading(false);
      return;
    }

    // 2️⃣ Build lookup map: logs[habitId][date] = completed
    const map = {};
    allLogs.forEach(log => {
      if (log.goalId === goal.id && dateRange.includes(log.date)) {
        if (!map[log.habitId]) {
          map[log.habitId] = {};
        }
        map[log.habitId][log.date] = log.completed;
      }
    });
    setLogsMap(map);
    setLoading(false);
  }

  if (loading) {
    return <p>Loading calendar...</p>;
  }

  if (habits.length === 0) {
    return (
      <div>
        <p>No habits in this goal yet.</p>
      </div>
    );
  }

  const handleDateSelect = (date) => {
    if (typeof onDateSelect === "function") {
      onDateSelect(date);
    }
  };

  return (
    <div style={{ position: "relative", width: "100%", overflow: "hidden" }}>
      <div 
        style={{ 
          overflowX: "auto", 
          overflowY: "hidden",
          width: "100%",
          WebkitOverflowScrolling: "touch",
          scrollBehavior: "auto",
        }}
        onScroll={(e) => setIsScrolled(e.target.scrollLeft > 0)}
      >
        <table style={{ borderCollapse: "collapse", minWidth: "100%", position: "relative", background: "var(--bg-card)", color: "var(--text-primary)", border: "1px solid var(--border-light)", borderRadius: "10px" }}>
        <thead>
          <tr>
            <th 
              className={`sticky-column ${isScrolled ? 'scrolled' : ''}`}
              style={{ 
                border: "1px solid var(--border-light)", 
                padding: "10px", 
                textAlign: "left",
                position: "sticky",
                left: 0,
                backgroundColor: "var(--bg-card)",
                zIndex: 20,
                minWidth: "120px",
                fontWeight: 700,
              }}>Habit</th>
            {dateRange.map(date => (
              <th
                key={date}
                style={{
                  border: "1px solid var(--border-light)",
                  padding: "10px 8px",
                  textAlign: "center",
                  cursor: "pointer",
                  userSelect: "none",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
                onClick={() => handleDateSelect(date)}
              >
                {new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map(habit => (
            <tr key={habit.id}>
              <td 
                className={`sticky-column ${isScrolled ? 'scrolled' : ''}`}
                style={{ 
                  border: "1px solid var(--border-light)", 
                  padding: "10px 8px", 
                  fontWeight: 600,
                  position: "sticky",
                  left: 0,
                  backgroundColor: "var(--bg-card)",
                  zIndex: 10,
                  minWidth: "120px",
                }}>
                {habit.title}
              </td>
              {dateRange.map(date => {
                const isCompleted = logsMap[habit.id]?.[date] === true;
                return (
                  <td
                    key={`${habit.id}-${date}`}
                    style={{
                      border: "1px solid var(--border-light)",
                      padding: "10px 8px",
                      textAlign: "center",
                      backgroundColor: isCompleted ? "var(--accent-strong)" : "var(--neutral-soft)",
                      color: isCompleted ? "#ffffff" : "var(--text-primary)",
                      cursor: "pointer",
                      userSelect: "none",
                      transition: "background-color 0.15s ease, color 0.15s ease",
                    }}
                    onClick={() => handleDateSelect(date)}
                  >
                    {isCompleted ? "✓" : ""}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}

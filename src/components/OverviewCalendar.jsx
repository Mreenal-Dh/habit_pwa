import { useEffect, useState, useContext } from "react";
import { HabitContext } from "../context/HabitContext";

export default function OverviewCalendar({ goal, onDateSelect }) {
  const [totalHabits, setTotalHabits] = useState(0);
  const [completionMap, setCompletionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { habits: allHabits, logs: allLogs } = useContext(HabitContext);

  // Get current month date range
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
      loadOverviewData();
    }
  }, [goal?.id, allHabits, allLogs]);

  function loadOverviewData() {
    setLoading(true);

    // 1️⃣ Count total habits for this goal
    const goalHabits = allHabits.filter(h => h.goalId === goal.id);
    const total = goalHabits.length;
    setTotalHabits(total);

    if (total === 0) {
      setLoading(false);
      return;
    }

    // 2️⃣ Build completion map: map[date] = count of completed habits
    const map = {};
    dateRange.forEach(date => {
      map[date] = 0;
    });

    allLogs.forEach(log => {
      if (log.goalId === goal.id && log.completed && dateRange.includes(log.date)) {
        map[log.date] = (map[log.date] || 0) + 1;
      }
    });

    setCompletionMap(map);
    setLoading(false);
  }

  function getCompletionState(date) {
    const completed = completionMap[date] || 0;
    if (completed === totalHabits && totalHabits > 0) {
      return "all";
    } else if (completed > 0) {
      return "some";
    } else {
      return "none";
    }
  }

  function getStateColor(state) {
    switch (state) {
      case "all":
        return "var(--accent-strong)"; // Green
      case "some":
        return "var(--warn)"; // Yellow
      case "none":
      default:
        return "var(--neutral-strong)"; // Gray
    }
  }

  function getStateLabel(state) {
    switch (state) {
      case "all":
        return "✓";
      case "some":
        return "◐";
      case "none":
      default:
        return "";
    }
  }

  if (loading) {
    return <p>Loading calendar...</p>;
  }

  if (totalHabits === 0) {
    return (
      <div>
        <h3 className="mb-sm">{goal.title} – Calendar Overview</h3>
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
    <div>
      <div className="mb-sm" style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
        <span style={{ marginRight: "12px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "var(--accent-strong)",
            marginRight: "4px",
            verticalAlign: "middle",
          }}></span>
          All
        </span>
        <span style={{ marginRight: "12px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "var(--warn)",
            marginRight: "4px",
            verticalAlign: "middle",
          }}></span>
          Some
        </span>
        <span>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "var(--neutral-strong)",
            marginRight: "4px",
            verticalAlign: "middle",
          }}></span>
          None
        </span>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(7, 1fr)",
        gap: "10px",
        width: "100%",
        padding: "4px 2px",
      }}>
        {dateRange.map(date => {
          const state = getCompletionState(date);

          return (
            <div
              key={date}
              style={{
                aspectRatio: "1",
                maxWidth: "32px",
                maxHeight: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: getStateColor(state),
                borderRadius: "4px",
                padding: "0",
                cursor: "pointer",
                border: "1px solid var(--border-light)",
              }}
              onClick={() => handleDateSelect(date)}
              title={`${date}: ${completionMap[date] || 0}/${totalHabits}`}
            >
            </div>
          );
        })}
      </div>
    </div>
  );
}

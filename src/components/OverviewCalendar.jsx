import { useEffect, useState, useContext, useCallback, useMemo } from "react";
import { HabitContext } from "../context/HabitContext";

export default function OverviewCalendar({ goal, onDateSelect }) {
  const [totalHabits, setTotalHabits] = useState(0);
  const [completionMap, setCompletionMap] = useState({});
  const [loading, setLoading] = useState(true);
  const { habits: allHabits, logs: allLogs } = useContext(HabitContext);

  function generateDateRangeFromDays(numberOfDays) {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < numberOfDays; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.unshift(date.toISOString().split("T")[0]);
    }
    
    return dates;
  }

  function getDefaultDaysForGoal(goalData) {
    const rawDate = goalData?.startDate || goalData?.createdAt;
    let baseDate = new Date();

    if (rawDate) {
      const parsed = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
      if (!isNaN(parsed.getTime())) {
        baseDate = parsed;
      }
    }

    return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
  }

  const effectiveNumberOfDays = useMemo(() => {
    const explicit = parseInt(goal?.numberOfDays);
    if (explicit && explicit > 0) return explicit;
    return getDefaultDaysForGoal(goal);
  }, [goal?.numberOfDays, goal?.startDate, goal?.createdAt]);

  // Memoize date range based on effectiveNumberOfDays
  const dateRange = useMemo(() => {
    return generateDateRangeFromDays(effectiveNumberOfDays);
  }, [effectiveNumberOfDays]);

  const loadOverviewData = useCallback(() => {
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
  }, [goal, allHabits, allLogs, dateRange]);

  useEffect(() => {
    if (goal?.id && allHabits.length > 0 && allLogs.length >= 0) {
      loadOverviewData();
    }
  }, [goal?.id, allHabits, allLogs, loadOverviewData]);

  function getCompletionPercentage(date) {
    const completed = completionMap[date] || 0;
    if (totalHabits === 0) return 0;
    return (completed / totalHabits) * 100;
  }

  function getCompletionState(date) {
    const percentage = getCompletionPercentage(date);
    if (percentage === 100) {
      return "all"; // Dark green - all tasks completed
    } else if (percentage >= 70) {
      return "high"; // Green - more than 70%
    } else if (percentage >= 50) {
      return "medium"; // Light green - more than 50%
    } else if (percentage >= 50) {
      return "half"; // Yellow - exactly 50%
    } else if (percentage > 0) {
      return "some"; // Light yellow - less than 50%
    } else {
      return "none"; // Gray - no tasks
    }
  }

  function getStateColor(state, date) {
    const todayStr = new Date().toISOString().split("T")[0];
    const isPast = date < todayStr;
    switch (state) {
      case "all":
        return "#1b5e20"; // Dark green - 100%
      case "high":
        return "#4caf50"; // Green - 70-99%
      case "medium":
        return "#81c784"; // Light green - 50-69%
      case "half":
        return "#fdd835"; // Yellow - 50%
      case "some":
        return "#fff176"; // Light yellow - less than 50%
      case "none":
      default:
        return isPast ? "#e53935" : "var(--neutral-strong)"; // Red past 0%, gray for future
    }
  }

  // Calculate grid columns: max 5 rows, so columns = ceil(dateRange / 5)
  const gridColumns = Math.ceil(dateRange.length / 5);

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
      <div className="mb-sm" style={{ fontSize: "12px", color: "var(--text-secondary)", display: "flex", flexWrap: "wrap", gap: "12px", paddingLeft: "16px", paddingRight: "16px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "#1b5e20",
          }}></span>
          100%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "#4caf50",
          }}></span>
          70-99%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "#81c784",
          }}></span>
          50-69%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "#fdd835",
          }}></span>
          &lt;50%
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "#e53935",
          }}></span>
          0% (Past)
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            backgroundColor: "var(--neutral-strong)",
          }}></span>
          Future
        </span>
      </div>

      <div style={{
        overflowX: "auto",
        overflowY: "hidden",
        width: "100%",
        paddingBottom: "12px",
        paddingLeft: "16px",
        paddingRight: "16px",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: `repeat(${gridColumns}, minmax(32px, 32px))`,
          columnGap: "10px",
          rowGap: "10px",
          padding: "4px 0",
          width: "fit-content",
          minWidth: "100%",
          justifyContent: "space-between",
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
                  backgroundColor: getStateColor(state, date),
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
    </div>
  );
}

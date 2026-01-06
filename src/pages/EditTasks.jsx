import { useEffect, useState, useContext } from "react";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";
import { db } from "../firebase";
import { Button } from "@mui/material";
import { useAuth } from "../auth/AuthContext";
import { HabitContext } from "../context/HabitContext";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EditTasks({ setScreen, goalId }) {
  const [goal, setGoal] = useState(null);
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [quote, setQuote] = useState("");
  const [startDate, setStartDate] = useState("");
  const { user } = useAuth();
  const { refreshGoals, refreshHabits } = useContext(HabitContext);

  useEffect(() => {
    if (goalId && user) {
      loadGoal();
      loadHabits();
    }
  }, [goalId, user]);

  async function loadGoal() {
    const goalSnap = await getDocs(
      query(
        collection(db, "goals"),
        where("__name__", "==", goalId),
        where("userId", "==", user.uid)
      )
    );
    if (!goalSnap.empty) {
      const goalData = { id: goalSnap.docs[0].id, ...goalSnap.docs[0].data() };
      setGoal(goalData);
      setGoalTitle(goalData.title);
      setQuote(goalData.quote || "");
      setStartDate(goalData.startDate ? toInputDate(goalData.startDate) : "");
    }
  }

  function toInputDate(value) {
    if (!value) return "";
    const date = value.toDate ? value.toDate() : new Date(value);
    if (isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  async function loadHabits() {
    const q = query(
      collection(db, "habits"),
      where("goalId", "==", goalId),
      where("userId", "==", user.uid)
    );
    const snap = await getDocs(q);
    setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }

  async function toggleDay(day) {
    const updatedDays = goal.days.includes(day)
      ? goal.days.filter(d => d !== day)
      : [...goal.days, day];

    await updateDoc(doc(db, "goals", goal.id), {
      days: updatedDays
    });

    setGoal({ ...goal, days: updatedDays });
    refreshGoals();
  }

  async function updateGoalTitle() {
    if (!goalTitle.trim() || goalTitle === goal.title) return;

    await updateDoc(doc(db, "goals", goal.id), {
      title: goalTitle.trim()
    });

    setGoal({ ...goal, title: goalTitle.trim() });
    refreshGoals();
  }

  async function updateQuote() {
    await updateDoc(doc(db, "goals", goal.id), {
      quote: quote.trim()
    });
    setGoal({ ...goal, quote: quote.trim() });
    refreshGoals();
  }

  async function updateStartDate(value) {
    setStartDate(value);
    const parsed = value ? new Date(value) : null;
    await updateDoc(doc(db, "goals", goal.id), {
      startDate: parsed,
    });
    setGoal({ ...goal, startDate: parsed });
    refreshGoals();
  }

  async function addHabit() {
    if (!newHabit.trim()) return;

    await addDoc(collection(db, "habits"), {
      title: newHabit,
      goalId: goal.id,
      userId: user.uid,
      createdAt: new Date()
    });

    setNewHabit("");
    loadHabits();
    refreshHabits();
  }

  async function deleteHabit(habitId) {
    await deleteDoc(doc(db, "habits", habitId));
    loadHabits();
    refreshHabits();
  }

  if (!goal) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <h1 style={{ marginBottom: "32px" }}>Edit Goal</h1>

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Goal Title
        </label>
        <input
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          onBlur={updateGoalTitle}
          style={{
            width: "100%",
            padding: "11px 14px",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: "14px",
            fontFamily: "Inter, system-ui, sans-serif",
          }}
        />
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Start Date (Optional)
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => updateStartDate(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        />
        <p style={{ marginTop: "6px", color: "var(--text-secondary)", fontSize: "12px" }}>
          Defaults to the goal creation date if left blank.
        </p>
      </div>

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Active Days
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "nowrap", overflowX: "auto" }}>
          {WEEK_DAYS.map((day) => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              style={{
                width: "44px",
                height: "44px",
                border: "2px solid var(--border-light)",
                backgroundColor: goal.days.includes(day) ? "var(--accent)" : "var(--bg-card)",
                color: goal.days.includes(day) ? "#ffffff" : "var(--text-primary)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                flexShrink: 0,
              }}
            >
              {day.slice(0, 2)}
            </button>
          ))}
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Quote (Optional)
        </label>
        <textarea
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          onBlur={updateQuote}
          placeholder="Add an inspiring quote for this goal..."
          style={{
            width: "100%",
            padding: "10px",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            minHeight: "60px",
            fontFamily: "Inter, system-ui, sans-serif",
            fontSize: "14px",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            resize: "vertical",
          }}
        />
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Habits
        </label>
        {habits.map((habit) => (
          <div 
            key={habit.id} 
            className="mb-xs" 
            style={{ 
              padding: "12px 16px", 
              display: "flex", 
              justifyContent: "space-between", 
              alignItems: "center",
              backgroundColor: "var(--bg-card)",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
            }}
          >
            <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "500" }}>{habit.title}</span>
            <button
              onClick={() => deleteHabit(habit.id)}
              style={{
                padding: "6px 8px",
                backgroundColor: "transparent",
                color: "#f44336",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "18px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background-color 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = "rgba(244, 67, 54, 0.08)"}
              onMouseLeave={(e) => e.target.style.backgroundColor = "transparent"}
            >
              🗑️
            </button>
          </div>
        ))}
        
        <div 
          className="mb-xs" 
          style={{ 
            padding: "12px 16px", 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            gap: "10px",
            backgroundColor: "var(--bg-card)",
            border: "1px solid var(--border-light)",
            borderRadius: "10px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
          }}
        >
          <input
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            placeholder="Add new habit"
            onKeyPress={(e) => e.key === "Enter" && addHabit()}
            style={{
              flex: 1,
              padding: "0",
              border: "none",
              outline: "none",
              backgroundColor: "transparent",
              color: "var(--text-primary)",
              fontSize: "15px",
              fontWeight: "500",
            }}
          />
          <button
            onClick={addHabit}
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "20px",
              width: "32px",
              height: "32px",
              minWidth: "32px",
              minHeight: "32px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease, opacity 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.1)";
              e.target.style.opacity = "0.9";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.opacity = "1";
            }}
          >
            +
          </button>
        </div>
      </div>

      <div style={{ marginTop: "32px", display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => setScreen({ name: "goals" })}
          style={{
            backgroundColor: "var(--accent)",
            color: "white",
            padding: "12px 28px",
            fontSize: "14px",
            fontWeight: "600",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "none";
          }}
        >
          Back to Goals
        </button>
      </div>
    </div>
  );
}

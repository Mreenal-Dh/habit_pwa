import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CreateGoal({ setScreen }) {
  const { user } = useAuth();
  const [goalTitle, setGoalTitle] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("");
  const [selectedDays, setSelectedDays] = useState([]);
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [quote, setQuote] = useState("");
  const [startDate, setStartDate] = useState("");
  const [saving, setSaving] = useState(false);

  function toggleDay(day) {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  }

  function addHabit() {
    if (!newHabit.trim()) return;
    setHabits(prev => [...prev, newHabit.trim()]);
    setNewHabit("");
  }

  function removeHabit(index) {
    setHabits(prev => prev.filter((_, i) => i !== index));
  }

  async function saveGoal() {
    if (!goalTitle.trim()) {
      alert("Please enter a goal title");
      return;
    }

    if (selectedDays.length === 0) {
      alert("Please select at least one day");
      return;
    }

    if (habits.length === 0) {
      alert("Please add at least one habit");
      return;
    }

    setSaving(true);

    try {
      // Calculate numberOfDays: use provided value or default to days in month
      let finalNumberOfDays = numberOfDays ? parseInt(numberOfDays) : null;
      
      if (!finalNumberOfDays || finalNumberOfDays < 1) {
        // Default to number of days in the month
        const targetDate = startDate ? new Date(startDate) : new Date();
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth();
        // Get last day of month
        finalNumberOfDays = new Date(year, month + 1, 0).getDate();
      }

      // 1️⃣ Create goal
      const goalRef = await addDoc(collection(db, "goals"), {
        title: goalTitle.trim(),
        numberOfDays: finalNumberOfDays,
        days: selectedDays,
        quote: quote.trim(),
        startDate: startDate ? new Date(startDate) : null,
        createdAt: serverTimestamp(),
        userId: user?.uid,
      });

      // 2️⃣ Create habits for this goal
      const habitPromises = habits.map(habitTitle =>
        addDoc(collection(db, "habits"), {
          title: habitTitle,
          goalId: goalRef.id,
          createdAt: serverTimestamp(),
          userId: user?.uid,
        })
      );

      await Promise.all(habitPromises);

      alert("Goal created successfully!");
      setScreen({ name: "goals" });
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create goal. Please try again.");
    }

    setSaving(false);
  }

  return (
    <div className="page">
      <h1 style={{ marginBottom: "32px" }}>Create New Goal</h1>

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Goal Title
        </label>
        <input
          type="text"
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
          placeholder="e.g., Get Fit, Learn Spanish"
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
          onChange={(e) => setStartDate(e.target.value)}
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

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Number of Days for Calendar
        </label>
        <input
          type="number"
          min="1"
          max="365"
          value={numberOfDays}
          onChange={(e) => setNumberOfDays(e.target.value)}
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
          Set the number of days to track. If more than 5 rows are needed, columns will expand horizontally.
        </p>
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

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
                backgroundColor: selectedDays.includes(day) ? "var(--accent)" : "var(--bg-card)",
                color: selectedDays.includes(day) ? "#ffffff" : "var(--text-primary)",
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
        {habits.map((habit, index) => (
          <div 
            key={index} 
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
            <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "500" }}>{habit}</span>
            <button
              onClick={() => removeHabit(index)}
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

      <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
        <button
          onClick={() => setScreen({ name: "goals" })}
          disabled={saving}
          style={{
            padding: "12px 20px",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Cancel
        </button>
        <button
          onClick={saveGoal}
          disabled={saving}
          style={{
            flex: 1,
            padding: "12px",
            backgroundColor: saving ? "var(--neutral-strong)" : "var(--accent)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: saving ? "not-allowed" : "pointer",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          {saving ? "Creating..." : "Create Goal"}
        </button>
      </div>
    </div>
  );
}

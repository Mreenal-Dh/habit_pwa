import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function CreateGoal({ setScreen }) {
  const { user } = useAuth();
  const [goalTitle, setGoalTitle] = useState("");
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
      // 1️⃣ Create goal
      const goalRef = await addDoc(collection(db, "goals"), {
        title: goalTitle.trim(),
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
    <div className="page" style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h1 className="mb-md">Create New Goal</h1>

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
            padding: "10px",
            border: "1px solid var(--border-light)",
            borderRadius: "8px",
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            fontSize: "14px",
          }}
        />
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>          Quote (Optional)
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
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>          Start Date (Optional)
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

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Active Days
        </label>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {WEEK_DAYS.map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              style={{
                padding: "8px 12px",
                border: "2px solid",
                borderColor: selectedDays.includes(day) ? "var(--accent)" : "var(--border-light)",
                backgroundColor: selectedDays.includes(day) ? "var(--accent)" : "var(--bg-card)",
                color: selectedDays.includes(day) ? "#ffffff" : "var(--text-primary)",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: selectedDays.includes(day) ? "bold" : "normal",
                fontSize: "14px",
              }}
            >
              {selectedDays.includes(day) ? `✓ ${day}` : day}
            </button>
          ))}
        </div>
      </div>

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Habits
        </label>
        
        {habits.length > 0 && (
          <div className="mb-md" style={{ padding: "0", listStyle: "none" }}>
            {habits.map((habit, index) => (
              <div
                key={index}
                className="mb-xs"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  backgroundColor: "var(--bg-card)",
                  borderRadius: "10px",
                  border: "1px solid var(--border-light)",
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
          </div>
        )}

        <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
          <input
            type="text"
            value={newHabit}
            onChange={(e) => setNewHabit(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addHabit()}
            placeholder="e.g., Walk, Workout"
            style={{
              flex: 1,
              padding: "11px 14px",
              border: "1px solid var(--border-light)",
              borderRadius: "10px",
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: "14px",
            }}
          />
          <button
            onClick={addHabit}
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              border: "2px solid var(--accent)",
              borderRadius: "50%",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "20px",
              width: "42px",
              height: "42px",
              minWidth: "42px",
              minHeight: "42px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.08)";
              e.target.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
              e.target.style.boxShadow = "none";
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

import { useEffect, useState, useContext, useCallback } from "react";
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
import { Button, IconButton, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import { useAuth } from "../auth/AuthContext";
import { HabitContext } from "../context/HabitContext";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function EditTasks({ setScreen, goalId }) {
  const [goal, setGoal] = useState(null);
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState("");
  const [goalTitle, setGoalTitle] = useState("");
  const [numberOfDays, setNumberOfDays] = useState("");
  const [quote, setQuote] = useState("");
  const [startDate, setStartDate] = useState("");
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [editingHabitTitle, setEditingHabitTitle] = useState("");
  const [deleteGoalDialogOpen, setDeleteGoalDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { user } = useAuth();
  const { refreshGoals, refreshHabits } = useContext(HabitContext);

  const loadGoal = useCallback(async () => {
    const toInputDate = (value) => {
      if (!value) return "";
      const date = value.toDate ? value.toDate() : new Date(value);
      if (isNaN(date.getTime())) return "";
      const year = date.getFullYear();
      const month = `${date.getMonth() + 1}`.padStart(2, "0");
      const day = `${date.getDate()}`.padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    const getDefaultDaysForGoal = (goalData) => {
      const rawDate = goalData?.startDate || goalData?.createdAt;
      let baseDate = new Date();

      if (rawDate) {
        const parsed = rawDate.toDate ? rawDate.toDate() : new Date(rawDate);
        if (!isNaN(parsed.getTime())) {
          baseDate = parsed;
        }
      }

      return new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
    };

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
      const fallbackDays = getDefaultDaysForGoal(goalData);
      setNumberOfDays(goalData.numberOfDays ? goalData.numberOfDays.toString() : fallbackDays.toString());
      setQuote(goalData.quote || "");
      setStartDate(goalData.startDate ? toInputDate(goalData.startDate) : "");
    }
  }, [goalId, user]);

  const loadHabits = useCallback(async () => {
    const q = query(
      collection(db, "habits"),
      where("goalId", "==", goalId),
      where("userId", "==", user.uid)
    );
    const snap = await getDocs(q);
    setHabits(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  }, [goalId, user]);

  useEffect(() => {
    if (goalId && user) {
      loadGoal();
      loadHabits();
    }
  }, [goalId, user, loadGoal, loadHabits]);

  function toggleDay(day) {
    const updatedDays = goal.days.includes(day)
      ? goal.days.filter(d => d !== day)
      : [...goal.days, day];

    setGoal({ ...goal, days: updatedDays });
  }

  async function saveGoalChanges() {
    if (!goalTitle.trim()) {
      setErrorMessage("Please enter a goal title.");
      setErrorDialogOpen(true);
      return;
    }

    const parsedStartDate = startDate ? new Date(startDate) : null;
    let finalNumberOfDays = numberOfDays ? parseInt(numberOfDays) : null;

    if (!finalNumberOfDays || finalNumberOfDays < 1) {
      let baseDate = parsedStartDate || new Date();
      if (!parsedStartDate && goal?.createdAt) {
        const created = goal.createdAt.toDate ? goal.createdAt.toDate() : new Date(goal.createdAt);
        if (!isNaN(created.getTime())) {
          baseDate = created;
        }
      }
      finalNumberOfDays = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0).getDate();
    }

    const payload = {
      title: goalTitle.trim(),
      quote: quote.trim(),
      startDate: parsedStartDate,
      numberOfDays: finalNumberOfDays,
      days: goal?.days || [],
    };

    try {
      await updateDoc(doc(db, "goals", goal.id), payload);
      setGoal({ ...goal, ...payload });
      refreshGoals();
      setScreen({ name: "goals" });
    } catch (error) {
      console.error("Error saving goal:", error);
      setErrorMessage("Failed to save changes. Please try again.");
      setErrorDialogOpen(true);
    }
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

  async function deleteGoal() {
    try {
      // Delete all habits associated with this goal
      const habitsQuery = query(
        collection(db, "habits"),
        where("goalId", "==", goalId),
        where("userId", "==", user.uid)
      );
      const habitsSnap = await getDocs(habitsQuery);
      await Promise.all(habitsSnap.docs.map(d => deleteDoc(doc(db, "habits", d.id))));

      // Delete all logs associated with this goal
      const logsQuery = query(
        collection(db, "habit_logs"),
        where("goalId", "==", goalId),
        where("userId", "==", user.uid)
      );
      const logsSnap = await getDocs(logsQuery);
      await Promise.all(logsSnap.docs.map(d => deleteDoc(doc(db, "habit_logs", d.id))));

      // Delete the goal
      await deleteDoc(doc(db, "goals", goalId));

      // Refresh context and navigate back
      refreshGoals();
      refreshHabits();
      setDeleteGoalDialogOpen(false);
      setScreen({ name: "goals" });
    } catch (error) {
      console.error("Error deleting goal:", error);
      setDeleteGoalDialogOpen(false);
      setErrorMessage("Failed to delete goal. Please try again.");
      setErrorDialogOpen(true);
    }
  }

  function startEditingHabit(habit) {
    setEditingHabitId(habit.id);
    setEditingHabitTitle(habit.title);
  }

  function cancelEditingHabit() {
    setEditingHabitId(null);
    setEditingHabitTitle("");
  }

  async function saveEditedHabit(habitId) {
    if (!editingHabitTitle.trim()) {
      cancelEditingHabit();
      return;
    }

    try {
      await updateDoc(doc(db, "habits", habitId), {
        title: editingHabitTitle.trim()
      });
      
      loadHabits();
      refreshHabits();
      cancelEditingHabit();
    } catch (error) {
      console.error("Error updating habit:", error);
      setErrorMessage("Failed to update habit. Please try again.");
      setErrorDialogOpen(true);
    }
  }

  if (!goal) {
    return <p>Loading...</p>;
  }

  return (
    <div className="page">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "32px" 
      }}>
        <h1 style={{ margin: 0 }}>Edit Goal</h1>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <IconButton
            onClick={saveGoalChanges}
            style={{
              backgroundColor: "var(--accent)",
              color: "white",
              border: "1px solid var(--accent)",
              padding: "8px",
            }}
            title="Save"
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            onClick={() => setDeleteGoalDialogOpen(true)}
            style={{
              backgroundColor: "#f44336",
              color: "white",
              border: "1px solid #f44336",
              padding: "8px",
            }}
            title="Delete goal"
          >
            <DeleteIcon />
          </IconButton>
        </div>
      </div>

      <div className="section">
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "600", fontSize: "14px" }}>
          Goal Title
        </label>
        <input
          value={goalTitle}
          onChange={(e) => setGoalTitle(e.target.value)}
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
            {editingHabitId === habit.id ? (
              <>
                <input
                  value={editingHabitTitle}
                  onChange={(e) => setEditingHabitTitle(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && saveEditedHabit(habit.id)}
                  onBlur={() => saveEditedHabit(habit.id)}
                  autoFocus
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    border: "1px solid var(--accent)",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-card)",
                    color: "var(--text-primary)",
                    fontSize: "15px",
                    fontWeight: "500",
                    outline: "none",
                  }}
                />
                <button
                  onClick={cancelEditingHabit}
                  style={{
                    padding: "6px 12px",
                    backgroundColor: "transparent",
                    color: "var(--text-secondary)",
                    border: "1px solid var(--border-light)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12px",
                    marginLeft: "8px",
                  }}
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <span style={{ color: "var(--text-primary)", fontSize: "15px", fontWeight: "500" }}>
                  {habit.title}
                </span>
                <div style={{ display: "flex", gap: "4px" }}>
                  <IconButton
                    onClick={() => startEditingHabit(habit)}
                    size="small"
                    style={{
                      color: "var(--accent)",
                    }}
                    title="Edit habit"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    onClick={() => deleteHabit(habit.id)}
                    size="small"
                    style={{
                      color: "#f44336",
                    }}
                    title="Delete habit"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </div>
              </>
            )}
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

      {/* Delete Goal Confirmation Dialog */}
      <Dialog
        open={deleteGoalDialogOpen}
        onClose={() => setDeleteGoalDialogOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle style={{ fontWeight: "700", color: "var(--text-primary)" }}>
          Delete Goal
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            Are you sure you want to delete this goal? This will also delete all associated habits and logs. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button 
            onClick={() => setDeleteGoalDialogOpen(false)} 
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={deleteGoal} 
            variant="contained"
            style={{ 
              backgroundColor: "#f44336",
              color: "white"
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog
        open={errorDialogOpen}
        onClose={() => setErrorDialogOpen(false)}
        PaperProps={{
          style: {
            backgroundColor: "var(--bg-card)",
            color: "var(--text-primary)",
            borderRadius: "12px",
          },
        }}
      >
        <DialogTitle style={{ fontWeight: "700", color: "var(--text-primary)" }}>
          Error
        </DialogTitle>
        <DialogContent>
          <DialogContentText style={{ color: "var(--text-secondary)", marginTop: "8px" }}>
            {errorMessage}
          </DialogContentText>
        </DialogContent>
        <DialogActions style={{ padding: "16px" }}>
          <Button 
            onClick={() => setErrorDialogOpen(false)} 
            variant="contained"
            style={{ 
              backgroundColor: "var(--accent)",
              color: "white"
            }}
          >
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

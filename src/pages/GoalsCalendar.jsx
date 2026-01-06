import { useEffect, useState, useContext } from "react";
import { HabitContext } from "../context/HabitContext";
import { Card, Button } from "@mui/material";

import GoalSelector from "../components/GoalSelector";
import CalendarToggle from "../components/CalendarToggle";
import MatrixCalendar from "../components/MatrixCalendar";
import OverviewCalendar from "../components/OverviewCalendar";
import DayDetails from "./DayDetails";

export default function GoalsCalendar({ setScreen, selectedGoal, setSelectedGoal }) {
  const [calendarType, setCalendarType] = useState(() => {
    return localStorage.getItem('calendarType') || 'matrix';
  });
  const [cardIndex, setCardIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [showPreStartDialog, setShowPreStartDialog] = useState(false);
  const [preStartDate, setPreStartDate] = useState(null);
  const [showDayDialog, setShowDayDialog] = useState(false);
  const [dialogDate, setDialogDate] = useState(null);

  const minSwipeDistance = 30;
  const swipeThreshold = 0.2; // 20% of container width

  const onTouchStart = (e) => {
    setIsDragging(true);
    setTouchStart(e.targetTouches[0].clientX);
    setDragOffset(0);
  };

  const onTouchMove = (e) => {
    if (!touchStart) return;
    const currentX = e.targetTouches[0].clientX;
    const offset = currentX - touchStart;
    setDragOffset(offset);
  };

  const onTouchEnd = (containerWidth) => {
    setIsDragging(false);
    if (!touchStart || !containerWidth) return;

    const dragThreshold = containerWidth * swipeThreshold;

    let newIndex = cardIndex;
    if (dragOffset > dragThreshold && cardIndex > 0) {
      newIndex = cardIndex - 1;
      setCardIndex(newIndex);
    } else if (dragOffset < -dragThreshold && cardIndex < (goals?.length || 0) - 1) {
      newIndex = cardIndex + 1;
      setCardIndex(newIndex);
    }

    // Update selectedGoal when swiping
    if (newIndex !== cardIndex && goals[newIndex]) {
      setSelectedGoal(goals[newIndex]);
    }

    setDragOffset(0);
    setTouchStart(null);
  };

  const { goals, habits, loading } = useContext(HabitContext);

  const getGoalStartDate = (goal) => {
    if (!goal) return null;
    const source = goal.startDate || goal.createdAt;
    if (!source) return null;
    if (typeof source.toDate === "function") return source.toDate();
    if (source.seconds) return new Date(source.seconds * 1000);
    const parsed = new Date(source);
    return isNaN(parsed.getTime()) ? null : parsed;
  };

  const dialogAnimations = `
    @keyframes dialogFade {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes dialogSlide {
      from { transform: translateY(8px) scale(0.99); }
      to { transform: translateY(0) scale(1); }
    }
  `;

  // Auto-select first goal
  useEffect(() => {
    if (goals.length > 0 && !selectedGoal) {
      setSelectedGoal(goals[0]);
      setCardIndex(0);
    }
  }, [goals, selectedGoal, setSelectedGoal]);

  // Sync cardIndex when selectedGoal changes (from dropdown)
  useEffect(() => {
    if (selectedGoal && goals.length > 0) {
      const index = goals.findIndex(g => g.id === selectedGoal.id);
      if (index !== -1 && index !== cardIndex) {
        setCardIndex(index);
      }
    }
  }, [selectedGoal, goals, cardIndex]);

  if (loading || !selectedGoal) {
    return <p>Loading...</p>;
  }

  const openDayDetails = (date) => {
    if (!selectedGoal || !date) return;

    const startDate = getGoalStartDate(selectedGoal);
    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      const clicked = new Date(`${date}T00:00:00`);
      if (clicked < start) {
        setPreStartDate(date);
        setShowPreStartDialog(true);
        return;
      }
    }

    setDialogDate(date);
    setShowDayDialog(true);
  };

  return (
    <>
    <style>{dialogAnimations}</style>
    <div className="page" style={{ paddingTop: "16px", paddingBottom: "80px" }}>
      <div style={{ marginBottom: "16px" }}>
        <h1>Goals & Calendar</h1>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <GoalSelector
          goals={goals}
          selectedGoal={selectedGoal}
          setSelectedGoal={setSelectedGoal}
        />
      </div>

      {/* Removed duplicate Calendar heading; will show bold Calendar next to toggle */}

      <div style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ marginBottom: 0 }}>Calendar</h2>
          <CalendarToggle
            calendarType={calendarType}
            setCalendarType={setCalendarType}
          />
        </div>

        <div className="calendar-wrapper" key={calendarType}>
          {calendarType === "matrix" ? (
            <MatrixCalendar goal={selectedGoal} onDateSelect={openDayDetails} />
          ) : (
            <OverviewCalendar goal={selectedGoal} onDateSelect={openDayDetails} />
          )}
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <h2 style={{ marginBottom: 0 }}>Goals</h2>
        <button
            onClick={() => setScreen({ name: "create" })}
            style={{
              padding: "5px 10px",
              backgroundColor: "var(--accent)",
              color: "#ffffff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "12px",
            }}
          >
            + New Goal
          </button>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            borderRadius: "8px",
            touchAction: "none",
          }}
        >
          <div
            style={{
              flex: 1,
              overflow: "hidden",
              borderRadius: "8px",
            }}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={(e) => {
              const containerWidth = e.currentTarget.offsetWidth;
              onTouchEnd(containerWidth);
            }}
          >
            <div
              style={{
                display: "flex",
                transition: isDragging ? "none" : "transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
                transform: `translateX(calc(-${cardIndex * 100}% + ${dragOffset}px))`,
                cursor: isDragging ? "grabbing" : "grab",
              }}
            >
              {goals.map((goal) => {
                const goalHabits = habits.filter(h => h.goalId === goal.id);
                const maxVisibleTasks = 5;
                const hasMoreTasks = goalHabits.length > maxVisibleTasks;
                const visibleTasks = hasMoreTasks ? goalHabits.slice(0, maxVisibleTasks) : goalHabits;

                return (
                  <div
                    key={goal.id}
                    style={{
                      flex: "0 0 100%",
                      minWidth: "100%",
                      pointerEvents: isDragging ? "none" : "auto",
                      padding: "0 4px",
                    }}
                  >
                    <Card 
                      style={{ 
                        padding: "clamp(12px, 3vw, 20px)",
                        maxHeight: "calc(100vh - 420px)",
                        minHeight: "200px",
                        display: "flex",
                        flexDirection: "column",
                        background: "var(--bg-card)",
                        color: "var(--text-primary)",
                        boxShadow: "var(--card-shadow)",
                        border: "1px solid var(--border-light)",
                        borderRadius: "14px",
                        transition: "box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease",
                        transform: "translateY(-2px)",
                      }}
                    >
                      <h3 className="mb-xs" style={{ fontWeight: 600 }}>{goal.title}</h3>

                      <div style={{ flex: 1, overflow: "auto", marginBottom: "12px" }}>
                        {goalHabits.length === 0 ? (
                          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No habits yet. Click Edit Tasks to add some.</p>
                        ) : (
                          <>
                            <ul style={{ listStyle: "disc", paddingLeft: "18px", color: "var(--text-primary)", lineHeight: 1.5 }}>
                              {visibleTasks.map((habit) => (
                                <li key={habit.id}>{habit.title}</li>
                              ))}
                            </ul>
                            
                            {hasMoreTasks && (
                              <div 
                                onClick={() => setScreen({ name: "edit", goalId: goal.id })}
                                style={{
                                  textAlign: "center",
                                  marginTop: "8px",
                                  color: "var(--accent)",
                                  fontSize: "14px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  textDecoration: "underline"
                                }}
                              >
                                View All ({goalHabits.length} habits)
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() =>
                            setScreen({
                              name: "edit",
                              goalId: goal.id,
                            })
                          }
                          style={{ padding: "5px 10px", fontWeight: 600, fontSize: "11px", minWidth: "0", backgroundColor: "var(--accent)" }}
                        >
                          Edit Tasks
                        </Button>
                      </div>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {goals.length > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "8px",
              marginTop: "12px",
            }}
          >
            {goals.map((_, index) => (
              <div
                key={index}
                onClick={() => setCardIndex(index)}
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: cardIndex === index ? "var(--accent)" : "var(--border-light)",
                  cursor: "pointer",
                  transition: "background-color 0.3s ease",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
    {showPreStartDialog && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          padding: "16px",
          animation: "dialogFade 160ms ease",
        }}
        onClick={() => setShowPreStartDialog(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            padding: "20px",
            maxWidth: "360px",
            width: "100%",
            boxShadow: "var(--card-shadow)",
            border: "1px solid var(--border-light)",
            textAlign: "center",
            animation: "dialogSlide 180ms ease",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0" }}>Goal not set</h3>
          <p style={{ margin: "0 0 16px 0", color: "#555" }}>
            This goal wasn't created yet on {preStartDate}.
          </p>
          <button
            onClick={() => setShowPreStartDialog(false)}
            style={{
              padding: "10px 18px",
              backgroundColor: "var(--accent)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Got it
          </button>
        </div>
      </div>
    )}
    {showDayDialog && (
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 998,
          padding: "16px",
          overflowY: "auto",
          animation: "dialogFade 160ms ease",
        }}
        onClick={() => setShowDayDialog(false)}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "var(--bg-card)",
            borderRadius: "12px",
            padding: "16px",
            width: "min(520px, 100%)",
            boxShadow: "var(--card-shadow)",
            border: "1px solid var(--border-light)",
            animation: "dialogSlide 200ms ease",
          }}
        >
          <DayDetails
            goalId={selectedGoal.id}
            date={dialogDate}
            onClose={() => setShowDayDialog(false)}
          />
        </div>
      </div>
    )}
    </>
  );
}

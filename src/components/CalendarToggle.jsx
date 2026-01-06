export default function CalendarToggle({ calendarType, setCalendarType }) {
  const handleCalendarChange = (type) => {
    setCalendarType(type);
    localStorage.setItem('calendarType', type);
  };
  
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      <button
        onClick={() => handleCalendarChange("matrix")}
        style={{
          padding: "6px 12px",
          fontSize: "12px",
          backgroundColor: calendarType === "matrix" ? "var(--accent)" : "var(--bg-card)",
          color: calendarType === "matrix" ? "#ffffff" : "var(--text-primary)",
          border: `1px solid ${calendarType === "matrix" ? "var(--accent)" : "var(--border-light)"}`,
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: calendarType === "matrix" ? "var(--card-shadow)" : "none",
          transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        Matrix
      </button>
      <button
        onClick={() => handleCalendarChange("overview")}
        style={{
          padding: "6px 12px",
          fontSize: "12px",
          backgroundColor: calendarType === "overview" ? "var(--accent)" : "var(--bg-card)",
          color: calendarType === "overview" ? "#ffffff" : "var(--text-primary)",
          border: `1px solid ${calendarType === "overview" ? "var(--accent)" : "var(--border-light)"}`,
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "600",
          boxShadow: calendarType === "overview" ? "var(--card-shadow)" : "none",
          transition: "background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        Overview
      </button>
    </div>
  );
}

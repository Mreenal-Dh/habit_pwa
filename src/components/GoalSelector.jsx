import { Select, MenuItem } from "@mui/material";

export default function GoalSelector({ goals, selectedGoal, setSelectedGoal }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <label style={{ fontSize: "13px", fontWeight: "600", color: "var(--text-primary)" }}>Goal:</label>

      <Select
        value={selectedGoal?.id || ""}
        onChange={(e) => {
          const goal = goals.find(g => g.id === e.target.value);
          setSelectedGoal(goal);
        }}
        displayEmpty
        size="small"
        sx={{
          minWidth: "140px",
          fontSize: "13px",
          fontWeight: "500",
          border: "1px solid var(--border-light)",
          borderRadius: "8px",
          backgroundColor: "var(--bg-card)",
          color: "var(--text-primary)",
          transition: "all 0.2s ease",
          "& .MuiSelect-select": {
            padding: "6px 10px",
          },
          "&:hover": {
            borderColor: "var(--accent)",
          },
          "&.Mui-focused": {
            borderColor: "var(--accent)",
            boxShadow: "0 0 0 3px rgba(76, 175, 80, 0.15)",
          },
          "& .MuiOutlinedInput-notchedOutline": {
            border: "none",
          },
          "& .MuiSvgIcon-root": {
            color: "var(--accent)",
          },
        }}
        MenuProps={{
          PaperProps: {
            sx: {
              backgroundColor: "var(--bg-card)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-light)",
              borderRadius: "8px",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              marginTop: "4px",
              "& .MuiList-root": {
                padding: "4px 0",
              },
            },
          },
        }}
      >
        <MenuItem 
          value="" 
          disabled
          sx={{
            color: "var(--text-secondary)",
            fontSize: "13px",
            fontStyle: "italic",
            padding: "8px 12px",
            "&:hover": {
              backgroundColor: "var(--neutral-soft)",
            },
          }}
        >
          Select a goal...
        </MenuItem>
        {goals.map(goal => (
          <MenuItem 
            key={goal.id} 
            value={goal.id}
            sx={{
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-card)",
              padding: "10px 12px",
              fontSize: "13px",
              fontWeight: "500",
              "&:hover": {
                backgroundColor: "var(--neutral-soft)",
              },
              "&.Mui-selected": {
                backgroundColor: "var(--accent-soft)",
                color: "var(--text-primary)",
                "&:hover": {
                  backgroundColor: "var(--accent-soft)",
                },
              },
            }}
          >
            {goal.title}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}

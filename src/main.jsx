import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./auth/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { ColorThemeProvider } from "./context/ColorThemeContext";
import "./styles/global.css";
import "./styles/ui.css";
import "./styles/bottomNav.css";
import "./styles/goals.css";
import "./styles/tracker.css";
import "./styles/editTasks.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      <ThemeProvider>
        <ColorThemeProvider>
          <App />
        </ColorThemeProvider>
      </ThemeProvider>
    </AuthProvider>
  </React.StrictMode>
);

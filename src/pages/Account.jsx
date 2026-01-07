import { useAuth } from "../auth/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { HabitContext } from "../context/HabitContext";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";
import { useColorTheme } from "../context/ColorThemeContext";

// Light/Dark variants for each profile
const profiles = [
  {
    light: new URL("../../profile/profile_1.png", import.meta.url).href,
    dark: new URL("../../profile/profile_1d.png", import.meta.url).href,
  },
  {
    light: new URL("../../profile/profile_2.png", import.meta.url).href,
    dark: new URL("../../profile/profile_2d.png", import.meta.url).href,
  },
  {
    light: new URL("../../profile/profile_3.png", import.meta.url).href,
    dark: new URL("../../profile/profile_3d.png", import.meta.url).href,
  },
  {
    light: new URL("../../profile/profile_4.jpg", import.meta.url).href,
    dark: new URL("../../profile/profile_4d.png", import.meta.url).href,
  },
];

// Map profile index to color theme
const profileToTheme = ["green", "red", "saffron", "blue"];

export default function Account() {
  const { user } = useAuth();
  const { clearData } = useContext(HabitContext);
  const { isDark, toggleTheme } = useTheme();
  const { colorTheme, setColorTheme } = useColorTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [themeTransition, setThemeTransition] = useState(false);
    // Trigger a brief smooth animation when theme flips
    useEffect(() => {
      setThemeTransition(true);
      const t = setTimeout(() => setThemeTransition(false), 240);
      return () => clearTimeout(t);
    }, [isDark]);
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(() => {
    const storedIndex = localStorage.getItem("selectedProfileIndex");
    if (storedIndex !== null) {
      const idx = parseInt(storedIndex, 10);
      return Number.isNaN(idx) ? 0 : Math.max(0, Math.min(idx, profiles.length - 1));
    }
    // Back-compat: try to map old stored image URL to an index
    const oldImg = localStorage.getItem("selectedProfileImage");
    if (oldImg) {
      const found = profiles.findIndex(p => p.light === oldImg || p.dark === oldImg);
      if (found >= 0) return found;
    }
    return 0;
  });

  // Persist selection and keep old key updated for any legacy reads
  useEffect(() => {
    localStorage.setItem("selectedProfileIndex", String(selectedProfileIndex));
    const currentSrc = profiles[selectedProfileIndex][isDark ? "dark" : "light"];
    localStorage.setItem("selectedProfileImage", currentSrc);
  }, [selectedProfileIndex, isDark]);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to delete all your habits, goals, and logs? This action cannot be undone.")) {
      await clearData();
      alert("All data has been reset.");
    }
  };

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="page">
      <h1 style={{ marginBottom: "24px" }}>Account</h1>

      {user && (
        <div
          className="section"
          style={{
            display: "grid",
            gridTemplateColumns: "auto 1fr",
            gap: "16px",
            alignItems: "center",
          }}
        >
          <div
            style={{
              width: "104px",
              height: "104px",
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: "0 12px 32px rgba(0,0,0,0.14)",
            }}
          >
            <img
              src={profiles[selectedProfileIndex][isDark ? "dark" : "light"]}
              alt="Profile"
              className={themeTransition ? "theme-transition-img" : undefined}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          </div>

          <div>
            <h3 className="mb-xs" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              Welcome, {userName}
            </h3>
            <p className="text-secondary mb-sm">{user.email}</p>

            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={() => setShowPicker(true)}
                style={{
                  padding: "9px 14px",
                  backgroundColor: "var(--bg-card)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border-light)",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Change Photo
              </button>
              <button
                onClick={handleLogout}
                style={{
                  padding: "9px 14px",
                  backgroundColor: "#f44336",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <h3 style={{ fontWeight: "500", marginBottom: "8px" }}>App Info</h3>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>habit. v0.0.0 (beta)</p>
      </div>

      <div className="section">
        <div className="theme-toggle-row">
          <div className="theme-toggle-copy">
            <h3 style={{ fontWeight: "500", marginBottom: "4px" }}>Theme</h3>
              <p className="text-secondary" style={{ marginBottom: 0 }}>
                Choose between dark and light
              </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isDark}
            aria-label={`Turn ${isDark ? "off" : "on"} dark mode`}
            onClick={toggleTheme}
            className="theme-switch"
            data-checked={isDark}
          >
            <span className="sr-only">Toggle dark mode</span>
          </button>
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--divider)", margin: "24px 0" }} />

      <div className="section">
        <h3 style={{ fontWeight: "500", marginBottom: "12px" }}>Reset Data</h3>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "12px" }}>Delete all your habits, goals, and logs</p>
        <button
          onClick={handleResetData}
          style={{
            padding: "8px 16px",
            backgroundColor: "#ff9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "600",
            fontSize: "14px",
          }}
        >
          Reset All Data
        </button>
      </div>

      {showPicker && (
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
            padding: "16px",
            zIndex: 1100,
          }}
          onClick={() => setShowPicker(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-card)",
              borderRadius: "12px",
              padding: "18px",
              width: "min(520px, 100%)",
              border: "1px solid var(--border-light)",
              boxShadow: "var(--card-shadow)",
            }}
          >
            <h3 style={{ margin: "0 0 16px 0" }}>Choose an avatar</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                gap: "12px",
              }}
            >
              {profiles.map((p, index) => {
                const isSelected = index === selectedProfileIndex;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedProfileIndex(index);
                      setColorTheme(profileToTheme[index]);
                      setShowPicker(false);
                    }}
                    style={{
                      padding: 0,
                      border: isSelected ? "2px solid var(--accent)" : "1px solid var(--border-light)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      cursor: "pointer",
                      boxShadow: isSelected ? "0 6px 18px rgba(76,175,80,0.3)" : "0 4px 10px rgba(0,0,0,0.08)",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
                    }}
                  >
                    <img
                      src={p[isDark ? "dark" : "light"]}
                      alt={`Profile option ${index + 1}`}
                      style={{
                        width: "100%",
                        aspectRatio: "1",
                        objectFit: "cover",
                        display: "block",
                        transform: isSelected ? "scale(1.02)" : "scale(1)",
                      }}
                    />
                  </button>
                );
              })}
            </div>
            <div style={{ marginTop: "18px", textAlign: "center" }}>
              <button
                onClick={() => setShowPicker(false)}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "var(--accent)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

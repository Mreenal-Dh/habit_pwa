import { useAuth } from "../auth/AuthContext";
import { auth } from "../firebase";
import { signOut } from "firebase/auth";
import { HabitContext } from "../context/HabitContext";
import { useContext, useEffect, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const profileImages = [
  new URL("../../profile/profile_1.png", import.meta.url).href,
  new URL("../../profile/profile_2.png", import.meta.url).href,
  new URL("../../profile/profile_3.png", import.meta.url).href,
  new URL("../../profile/profile_4.jpg", import.meta.url).href,
];

export default function Account() {
  const { user } = useAuth();
  const { clearData } = useContext(HabitContext);
  const { isDark, toggleTheme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(() => {
    const stored = localStorage.getItem("selectedProfileImage");
    return stored || user?.photoURL || profileImages[0];
  });

  useEffect(() => {
    if (selectedAvatar) {
      localStorage.setItem("selectedProfileImage", selectedAvatar);
    }
  }, [selectedAvatar]);

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
              src={selectedAvatar}
              alt="Profile"
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
              Defaults to your system. Once you change it, we remember your choice.
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
            <h3 style={{ margin: "0 0 12px 0" }}>Choose a photo</h3>
            <p style={{ margin: "0 0 16px 0", color: "var(--text-secondary)" }}>Pick an avatar; it updates immediately.</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(96px, 1fr))",
                gap: "12px",
              }}
            >
              {profileImages.map((src, index) => {
                const isSelected = src === selectedAvatar;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedAvatar(src);
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
                      src={src}
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
            <div style={{ marginTop: "18px", textAlign: "right" }}>
              <button
                onClick={() => setShowPicker(false)}
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

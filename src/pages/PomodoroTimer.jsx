import { useState, useEffect, useRef } from "react";
import "../styles/pomodoro.css";

const DEFAULT_SETTINGS = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  sessionsUntilLongBreak: 4,
};

export default function PomodoroTimer() {
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("pomodoroSettings");
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  const [mode, setMode] = useState("work"); // work | shortBreak | longBreak
  const [timeLeft, setTimeLeft] = useState(settings.workDuration * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Initialize audio
  useEffect(() => {
    audioRef.current = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYHGWm98OScTgwNUrDm77hlHAU2jdXzzn0vBSd6yO/glkIKElyx6OyrWBUIQ5zd8r93IwUucM/z14k4BxlqvO/mnVAMDlOx5vG5Zh0FN4/X88+BMAY");
  }, []);

  // Load time when mode or settings change
  useEffect(() => {
    let duration;
    if (mode === "work") duration = settings.workDuration;
    else if (mode === "shortBreak") duration = settings.shortBreakDuration;
    else duration = settings.longBreakDuration;
    
    setTimeLeft(duration * 60);
    setIsRunning(false);
  }, [mode, settings]);

  // Timer countdown logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  const handleTimerComplete = () => {
    setIsRunning(false);
    
    // Play notification sound
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log("Audio play failed:", e));
    }

    // Show browser notification if permitted
    if ("Notification" in window && Notification.permission === "granted") {
      const modeText = mode === "work" ? "Work session" : "Break";
      new Notification(`${modeText} complete!`, {
        body: "Time for the next session.",
        icon: "/icons/icon-192.png",
      });
    }

    // Auto-switch to next mode
    if (mode === "work") {
      const newSessions = sessionsCompleted + 1;
      setSessionsCompleted(newSessions);
      
      if (newSessions % settings.sessionsUntilLongBreak === 0) {
        setMode("longBreak");
      } else {
        setMode("shortBreak");
      }
    } else {
      setMode("work");
    }
  };

  const toggleTimer = () => {
    if (!isRunning && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    let duration;
    if (mode === "work") duration = settings.workDuration;
    else if (mode === "shortBreak") duration = settings.shortBreakDuration;
    else duration = settings.longBreakDuration;
    setTimeLeft(duration * 60);
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setIsRunning(false);
  };

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem("pomodoroSettings", JSON.stringify(newSettings));
    setShowSettings(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = () => {
    let totalDuration;
    if (mode === "work") totalDuration = settings.workDuration * 60;
    else if (mode === "shortBreak") totalDuration = settings.shortBreakDuration * 60;
    else totalDuration = settings.longBreakDuration * 60;
    
    return ((totalDuration - timeLeft) / totalDuration) * 100;
  };

  return (
    <div className="page pomodoro-page">
      <div className="pomodoro-header">
        <h1>Focus Timer</h1>
        <button 
          className="settings-btn"
          onClick={() => setShowSettings(!showSettings)}
          aria-label="Settings"
        >
          ⚙️
        </button>
      </div>

      {showSettings && (
        <SettingsPanel 
          settings={settings} 
          onSave={saveSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      <div className="pomodoro-content">
        {/* Timer Display */}
        <div className="timer-circle-wrapper">
          <svg className="timer-ring" viewBox="0 0 200 200">
            <circle
              className="timer-ring-bg"
              cx="100"
              cy="100"
              r="90"
            />
            <circle
              className={`timer-ring-progress ${mode}`}
              cx="100"
              cy="100"
              r="90"
              style={{
                strokeDasharray: `${2 * Math.PI * 90}`,
                strokeDashoffset: `${2 * Math.PI * 90 * (1 - progressPercentage() / 100)}`,
              }}
            />
          </svg>
          <div className="timer-display">
            <div className="time-text">{formatTime(timeLeft)}</div>
            <div className="mode-label">
              {mode === "work" ? "Focus Time" : mode === "shortBreak" ? "Short Break" : "Long Break"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="timer-controls">
          <button className="control-btn primary-btn" onClick={toggleTimer}>
            {isRunning ? "⏸ Pause" : "▶ Start"}
          </button>
          <button className="control-btn secondary-btn" onClick={resetTimer}>
            ↻ Reset
          </button>
        </div>

        {/* Mode Switch Button */}
        <button className="mode-switch-btn" onClick={() => {
          if (mode === "work") switchMode("shortBreak");
          else if (mode === "shortBreak") switchMode("longBreak");
          else switchMode("work");
        }}>
          Switch to {mode === "work" ? "Short Break" : mode === "shortBreak" ? "Long Break" : "Work"}
        </button>
      </div>
    </div>
  );
}

function SettingsPanel({ settings, onSave, onClose }) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({
      ...prev,
      [key]: parseInt(value) || 1,
    }));
  };

  return (
    <div className="settings-panel">
      <div className="settings-header">
        <h3>Timer Settings</h3>
        <button className="close-btn" onClick={onClose}>✕</button>
      </div>
      
      <div className="settings-form">
        <div className="setting-item">
          <label>Work Duration (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={localSettings.workDuration}
            onChange={(e) => handleChange("workDuration", e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label>Short Break (minutes)</label>
          <input
            type="number"
            min="1"
            max="30"
            value={localSettings.shortBreakDuration}
            onChange={(e) => handleChange("shortBreakDuration", e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label>Long Break (minutes)</label>
          <input
            type="number"
            min="1"
            max="60"
            value={localSettings.longBreakDuration}
            onChange={(e) => handleChange("longBreakDuration", e.target.value)}
          />
        </div>
        
        <div className="setting-item">
          <label>Sessions Until Long Break</label>
          <input
            type="number"
            min="2"
            max="10"
            value={localSettings.sessionsUntilLongBreak}
            onChange={(e) => handleChange("sessionsUntilLongBreak", e.target.value)}
          />
        </div>
        
        <button className="save-settings-btn" onClick={() => onSave(localSettings)}>
          Save Settings
        </button>
      </div>
    </div>
  );
}

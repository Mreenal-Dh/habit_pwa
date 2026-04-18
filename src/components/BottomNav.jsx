import { useEffect, useState } from "react";

export default function BottomNav({ setScreen, current }) {
  const [expandTrackerMenu, setExpandTrackerMenu] = useState(false);

  // Define carousel order: [tracker-like, water, pomodoro]
  const carouselButtons = [
    {
      id: "tracker",
      icon: (
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
          <line x1="16" y1="3" x2="16" y2="7" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="3" y1="11" x2="21" y2="11" />
        </svg>
      ),
      label: "Tracker",
      title: "Tracker",
    },
    {
      id: "water",
      icon: (
        <svg
          className="feature-icon"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
        </svg>
      ),
      label: "Water",
      title: "Water Tracker",
    },
    {
      id: "pomodoro",
      icon: (
        <svg
          className="feature-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <line x1="9" y1="2" x2="15" y2="2" />
          <line x1="12" y1="2" x2="12" y2="5" />
          <circle cx="12" cy="13" r="8" />
          <line x1="12" y1="13" x2="16" y2="10" />
        </svg>
      ),
      label: "Pomodoro",
      title: "Pomodoro Timer",
    },
  ];

  const handleTrackerClick = () => {
    // Toggle menu if on any feature page (tracker, water, pomodoro)
    const isOnFeaturePage = ["tracker", "water", "pomodoro"].includes(current);
    if (isOnFeaturePage) {
      setExpandTrackerMenu(!expandTrackerMenu);
    } else {
      // Navigate to the last used feature page, defaulting to tracker
      const lastFeature = typeof window !== "undefined" ? window.localStorage.getItem("lastFeaturePage") || "tracker" : "tracker";
      setScreen({ name: lastFeature });
    }
  };

  const handleCarouselButtonClick = (buttonId) => {
    setScreen({ name: buttonId });
    setExpandTrackerMenu(false);
    // Save last feature page
    if (typeof window !== "undefined") {
      window.localStorage.setItem("lastFeaturePage", buttonId);
    }
  };

  // Close the carousel menu when navigating to any page
  useEffect(() => {
    setExpandTrackerMenu(false);
    // Save last feature page when on a feature page
    const isOnFeaturePage = ["tracker", "water", "pomodoro"].includes(current);
    if (isOnFeaturePage && typeof window !== "undefined") {
      window.localStorage.setItem("lastFeaturePage", current);
    }
  }, [current]);

  // Determine which feature icon to show on the navbar button
  // Always show the last used feature page icon, regardless of current page
  const featurePages = ["tracker", "water", "pomodoro"];
  const lastFeature = typeof window !== "undefined" ? window.localStorage.getItem("lastFeaturePage") || "tracker" : "tracker";
  const currentNavFeature = featurePages.includes(current) ? current : lastFeature;
  const availableButtons = carouselButtons.filter((btn) => btn.id !== current);

  const renderNavIcon = (featureId) => {
    switch (featureId) {
      case "water":
        return (
          <svg
            className="nav-icon"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.32 0z" />
          </svg>
        );
      case "pomodoro":
        return (
          <svg
            className="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="9" y1="2" x2="15" y2="2" />
            <line x1="12" y1="2" x2="12" y2="5" />
            <circle cx="12" cy="13" r="8" />
            <line x1="12" y1="13" x2="16" y2="10" />
          </svg>
        );
      case "tracker":
      default:
        return (
          <svg
            className="nav-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="3" y="5" width="18" height="16" rx="2" ry="2" />
            <line x1="16" y1="3" x2="16" y2="7" />
            <line x1="8" y1="3" x2="8" y2="7" />
            <line x1="3" y1="11" x2="21" y2="11" />
          </svg>
        );
    }
  };

  return (
    <nav className="bottom-nav">
      {/* Expanded menu backdrop */}
      {expandTrackerMenu && ["tracker", "water", "pomodoro"].includes(current) && (
        <button
          className="menu-backdrop"
          onClick={() => setExpandTrackerMenu(false)}
          aria-label="Close menu"
        />
      )}

      {/* Animated carousel feature buttons */}
      {["tracker", "water", "pomodoro"].includes(current) && expandTrackerMenu && (
      <div className="feature-carousel expanded">
        {availableButtons.map((btn, index) => (
          <button
            key={btn.id}
            className={`carousel-btn carousel-btn-${index}`}
            onClick={() => handleCarouselButtonClick(btn.id)}
            title={btn.title}
            aria-label={btn.label}
          >
            {btn.icon}
            <span className="feature-label">{btn.label}</span>
          </button>
        ))}
      </div>
      )}

      {/* Main navigation buttons */}
      <button
        className={current === "goals" ? "active" : ""}
        onClick={() => {
          setExpandTrackerMenu(false);
          setScreen({ name: "goals" });
        }}
        aria-label="Goals"
        title="Goals"
      >
        {/* Dartboard/Target icon */}
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
        </svg>
      </button>

      <button
        className={`${["tracker", "water", "pomodoro"].includes(current) ? "active" : ""} ${expandTrackerMenu ? "expanded" : ""}`}
        onClick={handleTrackerClick}
        aria-label="Features"
        title="Features"
      >
        {renderNavIcon(currentNavFeature)}
      </button>

      <button
        className={current === "account" ? "active" : ""}
        onClick={() => {
          setExpandTrackerMenu(false);
          setScreen({ name: "account" });
        }}
        aria-label="Account"
        title="Account"
      >
        {/* User/Account icon */}
        <svg
          className="nav-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="12" cy="8" r="4" />
          <path d="M6 20c0-3.31 2.69-6 6-6s6 2.69 6 6" />
        </svg>
      </button>
    </nav>
  );
}


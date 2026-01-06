export default function BottomNav({ setScreen, current }) {
  return (
    <nav className="bottom-nav">
      <button
        className={current === "goals" ? "active" : ""}
        onClick={() => setScreen({ name: "goals" })}
      >
        Goals
      </button>

      <button
        className={current === "tracker" ? "active" : ""}
        onClick={() => setScreen({ name: "tracker" })}
      >
        Tracker
      </button>

      <button
        className={current === "account" ? "active" : ""}
        onClick={() => setScreen({ name: "account" })}
      >
        Account
      </button>
    </nav>
  );
}

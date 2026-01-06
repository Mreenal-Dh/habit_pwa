export default function Splash({ fadeOut }) {
  return (
    <div style={{ 
      height: "100vh", 
      display: "grid", 
      placeItems: "center",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.3s ease-out",
      backgroundColor: "var(--bg-main)",
    }}>
      <h1 style={{
        fontSize: "48px",
        fontWeight: "700",
        color: "var(--text-primary)",
        letterSpacing: "-1px",
      }}>habit.</h1>
    </div>
  );
}

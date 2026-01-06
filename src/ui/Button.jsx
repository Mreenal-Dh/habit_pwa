export default function Button({
  children,
  onClick,
  variant = "default",
  className = ""
}) {
  return (
    <button
      onClick={onClick}
      className={`ui-button ui-button-${variant} ${className}`}
    >
      {children}
    </button>
  );
}

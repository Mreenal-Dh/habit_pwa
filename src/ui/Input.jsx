export default function Input({
  value,
  onChange,
  placeholder,
  className = ""
}) {
  return (
    <input
      className={`ui-input ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
    />
  );
}

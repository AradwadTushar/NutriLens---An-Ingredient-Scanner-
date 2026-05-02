const Card = ({
  children,
  className = "",
  elevated = false,
  padding = "p-md",
}) => (
  <div
    className={`bg-surface-container-lowest rounded-2xl ${
      elevated
        ? "shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
        : "shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
    } ${padding} ${className}`}
  >
    {children}
  </div>
);

export default Card;
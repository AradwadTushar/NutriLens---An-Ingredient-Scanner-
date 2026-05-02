const Button = ({
  children,
  onClick,
  variant = "primary",
  className = "",
  disabled = false,
  type = "button",
  ...props
}) => {
  const variants = {
    primary: "bg-primary text-on-primary shadow-[0_8px_24px_rgba(53,37,205,0.25)] hover:bg-primary/90",
    secondary: "bg-surface-container-high text-on-surface hover:bg-surface-variant",
    outline: "border-2 border-primary text-primary hover:bg-primary/5",
    ghost: "text-on-surface-variant hover:bg-surface-container-high",
    danger: "bg-error text-on-error hover:bg-error/90",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      {...props}
      className={`inline-flex items-center justify-center gap-sm px-md py-3 rounded-xl text-label-md transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;
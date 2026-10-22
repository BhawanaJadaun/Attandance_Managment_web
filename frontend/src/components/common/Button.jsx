import { Loader2 } from "lucide-react";

// =====================================================
// HOW TO USE
// =====================================================
//
// <Button>Save</Button>
//
// <Button variant="primary">
//   Add Student
// </Button>
//
// <Button variant="outline">
//   Cancel
// </Button>
//
// <Button variant="danger">
//   Delete
// </Button>
//
// <Button
//   variant="primary"
//   icon={UserPlus}
// >
//   Add Student
// </Button>
//
// <Button
//   variant="primary"
//   loading
// >
//   Saving...
// </Button>
//
// Available variants:
// primary | secondary | outline | danger | success | ghost
// =====================================================

const variants = {
  primary:
    "bg-primary text-white hover:bg-primary-dark focus:ring-primary/20",

  secondary:
    "bg-primary-light text-primary hover:bg-primary hover:text-white focus:ring-primary/20",

  outline:
    "border border-border bg-white text-text-primary hover:bg-gray-50 focus:ring-primary/20",

  danger:
    "bg-danger text-white hover:bg-red-600 focus:ring-red-200",

  success:
    "bg-success text-white hover:bg-green-600 focus:ring-green-200",

  ghost:
    "bg-transparent text-text-secondary hover:bg-gray-100 hover:text-text-primary",
};

export default function Button({
  children,
  type = "button",
  variant = "primary",
  icon: Icon,
  iconPosition = "left",
  loading = false,
  disabled = false,
  onClick,
  className = "",
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-lg
        px-4
        py-2.5
        text-sm
        font-medium
        transition-all
        duration-200
        focus:outline-none
        focus:ring-4
        disabled:cursor-not-allowed
        disabled:opacity-60
        ${variants[variant] || variants.primary}
        ${className}
      `}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <>
          {Icon && iconPosition === "left" && (
            <Icon className="h-4 w-4" />
          )}

          {children}

          {Icon && iconPosition === "right" && (
            <Icon className="h-4 w-4" />
          )}
        </>
      )}
    </button>
  );
}
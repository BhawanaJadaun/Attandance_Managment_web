// =====================================================
// HOW TO USE
// =====================================================
//
// <Badge variant="active">Active</Badge>
// <Badge variant="absent">Absent</Badge>
// <Badge variant="leave">Leave</Badge>
// <Badge variant="pending">Pending</Badge>
// <Badge variant="inactive">Inactive</Badge>
//
// Custom class:
// <Badge variant="active" className="px-4">
//   Active
// </Badge>
// =====================================================

const variants = {
  active: "bg-green-50 text-green-600",
  success: "bg-green-50 text-green-600",

  absent: "bg-red-50 text-red-600",
  danger: "bg-red-50 text-red-600",

  leave: "bg-yellow-50 text-yellow-600",
  warning: "bg-yellow-50 text-yellow-600",

  pending: "bg-orange-50 text-orange-600",

  inactive: "bg-gray-100 text-gray-600",
  default: "bg-gray-100 text-gray-600",
};

export default function Badge({
  children,
  variant = "default",
  className = "",
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        whitespace-nowrap
        rounded-full
        px-3
        py-1
        text-xs
        font-medium
        ${variants[variant] || variants.default}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
// =====================================================
// HOW TO USE
// =====================================================
//
// <PageHeader
//   title="Students"
//   description="Manage all students in your institution."
// />
//
// With button:
//
// <PageHeader
//   title="Students"
//   description="Manage all students."
//   actions={
//     <Button>Add Student</Button>
//   }
// />
// =====================================================

export default function PageHeader({
  title,
  description,
  actions,
  className = "",
}) {
  return (
    <div
      className={`
        mb-6
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
        ${className}
      `}
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
          {title}
        </h1>

        {description && (
          <p className="mt-1 text-sm text-text-secondary sm:text-base">
            {description}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}
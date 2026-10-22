// =====================================================
// HOW TO USE
// =====================================================
//
// <Card>
//   Your content
// </Card>
//
// With title:
//
// <Card
//   title="Student Information"
//   description="Enter student details."
// >
//   Your form here
// </Card>
//
// With actions:
//
// <Card
//   title="Students"
//   actions={
//     <Button>Add Student</Button>
//   }
// >
//   Your content
// </Card>
// =====================================================

export default function Card({
  children,
  title,
  description,
  actions,
  className = "",
  bodyClassName = "",
}) {
  return (
    <div
      className={`
        w-full p-0
        rounded-xl
        border
        border-border
        bg-white
        shadow-card
        ${className}
      `}
    >
      {(title || description || actions) && (
        <div
          className="
            flex
            flex-col
            gap-3
            border-b
            border-border-light
            px-5
            py-4
            sm:flex-row
            sm:items-center
            sm:justify-between
          "
        >
          <div>
            {title && (
              <h2 className="text-base font-semibold text-text-primary">
                {title}
              </h2>
            )}

            {description && (
              <p className="mt-1 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>

          {actions && (
            <div className="flex items-center gap-2">
              {actions}
            </div>
          )}
        </div>
      )}

      <div className={`p-5 ${bodyClassName}`}>
        {children}
      </div>
    </div>
  );
}
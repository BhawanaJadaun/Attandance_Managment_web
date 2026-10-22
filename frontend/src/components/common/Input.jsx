// =====================================================
// HOW TO USE
// =====================================================
//
// <Input
//   label="Student Name"
//   name="name"
//   value={formData.name}
//   onChange={handleChange}
//   placeholder="Enter student name"
//   required
// />
//
// With icon:
//
// <Input
//   label="Search"
//   name="search"
//   value={search}
//   onChange={handleChange}
//   icon={Search}
// />
//
// With error:
//
// <Input
//   label="Student Name"
//   name="name"
//   value={formData.name}
//   onChange={handleChange}
//   error="Please enter student name."
// />
// =====================================================

export default function Input({
  label,
  name,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  required = false,
  disabled = false,
  error = "",
  helperText = "",
  icon: Icon,
  className = "",
}) {
  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="mb-1.5 block text-sm font-medium text-text-primary"
        >
          {label}

          {required && (
            <span className="ml-1 text-danger">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        )}

        <input
          id={id || name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={`
            h-11
            w-full
            rounded-lg
            border
            bg-white
            px-3
            text-sm
            text-text-primary
            outline-none
            transition
            placeholder:text-text-muted
            focus:ring-4
            disabled:cursor-not-allowed
            disabled:bg-gray-50
            ${Icon ? "pl-10" : ""}
            ${
              error
                ? "border-danger focus:border-danger focus:ring-red-100"
                : "border-border focus:border-primary focus:ring-primary/10"
            }
            ${className}
          `}
        />
      </div>

      {error && (
        <p className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}

      {!error && helperText && (
        <p className="mt-1 text-xs text-text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
}
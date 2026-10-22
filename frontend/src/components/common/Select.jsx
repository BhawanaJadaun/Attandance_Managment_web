// =====================================================
// HOW TO USE
// =====================================================
//
// const COURSE_OPTIONS = [
//   { value: "MCA", label: "MCA" },
//   { value: "BCA", label: "BCA" },
// ];
//
// <Select
//   label="Course"
//   name="course"
//   value={formData.course}
//   onChange={handleChange}
//   options={COURSE_OPTIONS}
//   required
// />
//
// =====================================================

export default function Select({
  label,
  name,
  id,
  value,
  onChange,
  options = [],
  required = false,
  disabled = false,
  error = "",
  placeholder = "",
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

      <select
        id={id || name}
        name={name}
        value={value}
        onChange={onChange}
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
          focus:ring-4
          disabled:cursor-not-allowed
          disabled:bg-gray-50
          ${
            error
              ? "border-danger focus:border-danger focus:ring-red-100"
              : "border-border focus:border-primary focus:ring-primary/10"
          }
          ${className}
        `}
      >
        {placeholder && (
          <option value="">
            {placeholder}
          </option>
        )}

        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
          >
            {option.label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
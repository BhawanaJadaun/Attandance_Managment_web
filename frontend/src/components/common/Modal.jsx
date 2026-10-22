// usage <Modal
//   isOpen={isEditOpen}
//   onClose={() => setIsEditOpen(false)}
//   title="Edit Student"
//   description="Update student information"
// >
//   <StudentForm />
// </Modal>
import { X } from "lucide-react";
import { useEffect } from "react";

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showClose = true,
}) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-6xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`
          relative
          z-10
          max-h-[90vh]
          w-full
          overflow-y-auto
          rounded-xl
          bg-white
          shadow-2xl
          ${sizes[size] || sizes.md}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border-light px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-text-primary">
              {title}
            </h2>

            {description && (
              <p className="mt-1 text-sm text-text-secondary">
                {description}
              </p>
            )}
          </div>

          {showClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-text-muted transition hover:bg-gray-100 hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}
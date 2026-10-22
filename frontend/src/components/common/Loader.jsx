// Usage
// <Loader />
// <Loader
//   size="lg"
//   text="Loading students..."
// />

// Full screen:

// <Loader
//   size="xl"
//   text="Please wait..."
//   fullScreen
// />
import { Loader2 } from "lucide-react";

export default function Loader({
  size = "md",
  text = "",
  fullScreen = false,
}) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-10 w-10",
  };

  const content = (
    <div className="flex flex-col items-center justify-center gap-2">
      <Loader2
        className={`
          animate-spin
          text-primary
          ${sizes[size] || sizes.md}
        `}
      />

      {text && (
        <p className="text-sm text-text-secondary">
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
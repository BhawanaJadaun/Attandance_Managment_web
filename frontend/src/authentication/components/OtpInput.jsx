import { useEffect, useRef } from "react";

function OtpInput({
  value = "",
  onChange,
  length = 6,
}) {
  const inputRefs = useRef([]);

  const digits = Array.from(
    { length },
    (_, index) => value[index] || ""
  );

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index, event) => {
    const inputValue = event.target.value;

    // Keep only numbers
    const digit = inputValue.replace(/\D/g, "").slice(-1);

    const newOtp = digits
      .map((item, i) => (i === index ? digit : item))
      .join("");

    onChange(newOtp);

    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (
      event.key === "Backspace" &&
      !digits[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, length);

    if (!pasted) return;

    onChange(pasted);

    const nextIndex = Math.min(
      pasted.length,
      length - 1
    );

    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div
      className="flex w-full justify-center gap-2 sm:gap-3"
      role="group"
      aria-label="One-time password"
    >
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputRefs.current[index] = element;
          }}
          type="text"
          inputMode="numeric"
          autoComplete={
            index === 0 ? "one-time-code" : "off"
          }
          maxLength={1}
          value={digit}
          onChange={(event) =>
            handleChange(index, event)
          }
          onKeyDown={(event) =>
            handleKeyDown(index, event)
          }
          onPaste={handlePaste}
          aria-label={`OTP digit ${index + 1}`}
          className="
            h-12 w-11
            rounded-xl
            border border-slate-300
            bg-white
            text-center text-xl font-bold
            text-slate-900
            outline-none
            transition-all
            focus:border-blue-500
            focus:ring-4
            focus:ring-blue-500/15
            dark:border-slate-700
            dark:bg-slate-800
            dark:text-white
            dark:focus:border-blue-400
            sm:h-14 sm:w-14
            sm:text-2xl
          "
        />
      ))}
    </div>
  );
}

export default OtpInput;
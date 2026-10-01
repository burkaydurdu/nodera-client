"use client";

import { Input } from "antd";
import { CODE_LENGTH } from "@/core/auth";
import type { CodeInputProps } from "./type";

/** Large, centered, numeric one-time-code input (antd Input.OTP). */
export default function CodeInput({
  value,
  onChange,
  length = CODE_LENGTH,
  disabled = false,
  error = false,
  onComplete,
  autoFocus = false,
}: CodeInputProps) {
  return (
    <div className="nodera-code-input flex justify-center">
      <Input.OTP
        length={length}
        value={value}
        onChange={onChange}
        onInput={(chars) => {
          const joined = chars.join("");
          if (joined.length === length && onComplete) onComplete(joined);
        }}
        formatter={(raw) => raw.replace(/\D/g, "")}
        disabled={disabled}
        status={error ? "error" : undefined}
        size="large"
        autoFocus={autoFocus}
        inputMode="numeric"
      />
    </div>
  );
}

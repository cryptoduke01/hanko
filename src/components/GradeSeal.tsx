import type { Grade } from "@/lib/types";

interface GradeSealProps {
  grade: Grade;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "h-6 w-6 text-[11px]",
  md: "h-8 w-8 text-sm",
  lg: "h-12 w-12 text-xl",
};

export function GradeSeal({ grade, size = "md" }: GradeSealProps) {
  const isFail = grade === "F";

  return (
    <span
      className={`inline-flex items-center justify-center border font-mono font-semibold tracking-tight transition-transform duration-300 hover:scale-105 ${sizeClasses[size]} ${
        isFail
          ? "border-fail bg-fail text-white"
          : "border-ink bg-paper text-ink"
      }`}
      style={{ borderRadius: 2 }}
      aria-label={`Grade ${grade}`}
      title={`Grade ${grade}`}
    >
      {grade}
    </span>
  );
}

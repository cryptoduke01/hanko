import { Loader } from "@/components/Loader";

/** The shared action button used across the console and the market. `busy`
 *  holds the label of whatever action is in flight; a button whose own `label`
 *  matches shows the loader and every button disables while one runs. */
export function ActionButton({
  onClick,
  busy,
  label,
  children,
  variant = "solid",
  disabled = false,
}: {
  onClick: () => void;
  busy: string | null;
  label: string;
  children: React.ReactNode;
  variant?: "solid" | "ghost";
  disabled?: boolean;
}) {
  const isBusy = busy === label;
  const base =
    "press shrink-0 whitespace-nowrap rounded-lg px-4 py-2.5 text-[11px] font-semibold tracking-[0.01em] transition-opacity duration-200 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-paper";
  const skin =
    variant === "solid"
      ? "border border-ink bg-ink text-paper hover:opacity-90"
      : "border border-rule text-ink hover:border-ink";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={Boolean(busy) || disabled}
      aria-busy={isBusy}
      className={`${base} ${skin}`}
    >
      {isBusy ? <Loader size={14} /> : children}
    </button>
  );
}

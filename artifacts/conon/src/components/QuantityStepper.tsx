import React from "react";
import { Minus, Plus, ShoppingCart } from "lucide-react";

const BLINKIT_GREEN = "#0c831f";

type Size = "sm" | "md" | "lg";

const SIZES: Record<Size, { h: string; text: string; icon: string; pad: string; input: string }> = {
  sm: { h: "h-8",  text: "text-[12px]", icon: "w-3.5 h-3.5", pad: "px-2", input: "w-7" },
  md: { h: "h-10", text: "text-[14px]", icon: "w-4 h-4",     pad: "px-3", input: "w-9" },
  lg: { h: "h-12", text: "text-[16px]", icon: "w-5 h-5",     pad: "px-4", input: "w-12" },
};

export type QuantityStepperProps = {
  /** Current quantity in cart. 0 → renders the "ADD" button. */
  qty: number;
  /** Called with the new desired quantity (0 means remove). */
  onChange: (qty: number) => void;
  /** Disables controls while a mutation is in flight. */
  isBusy?: boolean;
  size?: Size;
  fullWidth?: boolean;
  /** Solid green fill (e.g. modal footer) vs white outline (cards). */
  solid?: boolean;
  /** Text on the ADD button. */
  addLabel?: string;
  /** Maximum quantity (default 999). */
  max?: number;
  className?: string;
};

/**
 * QuantityStepper — Blinkit-style cart control. Shows an "ADD" button when the
 * item isn't in the cart; once added it becomes a −/quantity/+ stepper whose
 * middle value is a real number input the customer can type into directly.
 */
export function QuantityStepper({
  qty,
  onChange,
  isBusy = false,
  size = "sm",
  fullWidth = false,
  solid = false,
  addLabel = "ADD",
  max = 999,
  className = "",
}: QuantityStepperProps) {
  const s = SIZES[size];
  const [draft, setDraft] = React.useState(String(qty));
  const [editing, setEditing] = React.useState(false);
  // Set when Escape is pressed so the ensuing onBlur skips committing the draft.
  const cancelRef = React.useRef(false);

  // Keep the input in sync with external qty changes (unless actively typing).
  React.useEffect(() => {
    if (!editing) setDraft(String(qty));
  }, [qty, editing]);

  const commit = (raw: string) => {
    const n = parseInt(raw.replace(/[^0-9]/g, ""), 10);
    if (!Number.isFinite(n) || n <= 0) {
      onChange(0);
    } else {
      onChange(Math.min(max, n));
    }
  };

  const dec = () => { if (!isBusy) onChange(qty - 1); };
  const inc = () => { if (!isBusy) onChange(Math.min(max, qty + 1)); };

  if (qty <= 0) {
    return (
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); if (!isBusy) onChange(1); }}
        disabled={isBusy}
        className={`inline-flex items-center justify-center gap-1 rounded-lg font-black active:scale-95 transition disabled:opacity-60 ${s.h} ${s.text} ${s.pad} ${fullWidth ? "w-full" : ""} ${className}`}
        style={
          solid
            ? { background: BLINKIT_GREEN, color: "#fff" }
            : { background: "#fff", color: BLINKIT_GREEN, border: `1.5px solid ${BLINKIT_GREEN}` }
        }
      >
        <ShoppingCart className={s.icon} strokeWidth={2.4} />
        {addLabel}
      </button>
    );
  }

  const wrapStyle = solid
    ? { background: BLINKIT_GREEN, color: "#fff" }
    : { background: "#fff", color: BLINKIT_GREEN, border: `1.5px solid ${BLINKIT_GREEN}` };

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      className={`inline-flex items-center justify-between rounded-lg font-black select-none ${s.h} ${s.text} ${fullWidth ? "w-full" : ""} ${className}`}
      style={wrapStyle}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        onClick={(e) => { e.stopPropagation(); dec(); }}
        disabled={isBusy}
        className={`flex items-center justify-center h-full ${s.pad} active:scale-90 transition disabled:opacity-50`}
      >
        <Minus className={s.icon} strokeWidth={3} />
      </button>

      <input
        type="text"
        inputMode="numeric"
        aria-label="Quantity"
        value={draft}
        disabled={isBusy}
        onClick={(e) => { e.stopPropagation(); (e.target as HTMLInputElement).select(); }}
        onFocus={(e) => { setEditing(true); e.target.select(); }}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ""))}
        onBlur={() => {
          setEditing(false);
          if (cancelRef.current) { cancelRef.current = false; setDraft(String(qty)); return; }
          commit(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") { (e.target as HTMLInputElement).blur(); }
          if (e.key === "Escape") { cancelRef.current = true; (e.target as HTMLInputElement).blur(); }
        }}
        className={`${s.input} text-center bg-transparent outline-none font-black tabular-nums`}
        style={{ color: solid ? "#fff" : BLINKIT_GREEN }}
      />

      <button
        type="button"
        aria-label="Increase quantity"
        onClick={(e) => { e.stopPropagation(); inc(); }}
        disabled={isBusy || qty >= max}
        className={`flex items-center justify-center h-full ${s.pad} active:scale-90 transition disabled:opacity-50`}
      >
        <Plus className={s.icon} strokeWidth={3} />
      </button>
    </div>
  );
}

"use client";

import { plushieStyles } from "@/lib/prompts";
import type { PlushieStyle } from "@/types";
import { cn } from "@/lib/utils";

export function StylePicker({
  value,
  onChange
}: {
  value: PlushieStyle;
  onChange: (style: PlushieStyle) => void;
}) {
  return (
    <div className="grid gap-3">
      {plushieStyles.map((style) => {
        const active = style.value === value;

        return (
          <button
            key={style.value}
            type="button"
            onClick={() => onChange(style.value)}
            className={cn(
              "rounded-[22px] border px-4 py-4 text-left transition duration-200",
              active
                ? "border-[rgba(183,125,63,0.45)] bg-[rgba(255,245,234,0.95)] shadow-[0_12px_32px_rgba(183,125,63,0.16)]"
                : "border-[rgba(173,118,63,0.16)] bg-white/70 hover:bg-white/85"
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="pr-2">
                <p className="text-[15px] font-semibold text-[var(--text)]">{style.label}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{style.description}</p>
              </div>

              <div
                className={cn(
                  "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                  active
                    ? "border-[var(--gold)] bg-[var(--gold)]"
                    : "border-[rgba(173,118,63,0.35)] bg-transparent"
                )}
              >
                {active ? <div className="h-2 w-2 rounded-full bg-white" /> : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// src/components/collect/SortModal.tsx
"use client";

export type SortOptionId = "best-offer" | "last-sale" | "rarity" | "time-listed";
export type SortDirection = "asc" | "desc";

type SortModalProps = {
  open: boolean;
  onClose: () => void;
  option: SortOptionId;
  direction: SortDirection;
  onChangeOption: (opt: SortOptionId) => void;
  onChangeDirection: (dir: SortDirection) => void;
};

export default function SortModal({
  open,
  onClose,
  option,
  direction,
  onChangeOption,
  onChangeDirection,
}: SortModalProps) {
  if (!open) return null;

  const options = [
    { id: "best-offer", label: "Best offer" },
    { id: "last-sale", label: "Last sale" },
    { id: "rarity", label: "Rarity" },
    { id: "time-listed", label: "Time listed" },
  ] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="relative w-full max-w-xs rounded-[24px] border-[3px] border-black bg-white px-8 py-10 md:py-12 shadow-cartoonTwo">

        {/* 🔥 Close button floating di kanan atas */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#ff6b81] text-sm font-black shadow-cartoonTwo"
        >
          ✕
        </button>

        <h3 className="mb-4 md:mb-6 text-center text-lg md:text-2xl font-black">Sort by</h3>

        <div className="space-y-2">
          {options.map((opt) => {
            const isActive = opt.id === option;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChangeOption(opt.id)}
                className="flex w-full items-center justify-between rounded-[12px] px-1 py-[6px] text-left text-sm md:text-md"
              >
                <span className="font-medium">{opt.label}</span>
                {isActive && <span className="text-lg leading-none">✓</span>}
              </button>
            );
          })}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => onChangeDirection("asc")}
            className={[
              "flex-1 rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-semibold",
              direction === "asc" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          >
            Asc
          </button>

          <button
            type="button"
            onClick={() => onChangeDirection("desc")}
            className={[
              "flex-1 rounded-[12px] border-[3px] border-black px-4 py-2 text-sm font-semibold",
              direction === "desc" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          >
            Desc
          </button>
        </div>
      </div>
    </div>
  );
}

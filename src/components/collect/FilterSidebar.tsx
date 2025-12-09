import { useRef, useState, useEffect } from "react";

/**
 * Filter IDs yang bisa dipakai di layer backend / query builder.
 * Ini jembatan antara UI dan API.
 */
export type AttributeFilterId = "ponytail" | "body" | "type" | "background";

export const ATTRIBUTE_FILTERS: { id: AttributeFilterId; label: string }[] = [
  { id: "ponytail", label: "Ponytail" },
  { id: "body", label: "Body" },
  { id: "type", label: "Type" },
  { id: "background", label: "Background" },
];

export const FACE_FILTER_OPTIONS = [
  "Normal",
  "Yawn",
  "Nerd",
  "Angry",
  "Sad",
  "Happy",
  "Grinning",
  "Excited",
  "Sleepy",
  "Confused",
  "Crying",
  "Scary",
] as const;

export interface FilterSidebarProps {
  /** Klik "Show unlisted" – bisa di-mapped ke filter boolean di API */
  onShowUnlistedClick?: () => void;
  /** Klik salah satu attribute filter button (Ponytail/Body/Type/Background) */
  onAttributeFilterClick?: (id: AttributeFilterId) => void;
}

type MobileFilterDrawerProps = FilterSidebarProps & {
  open: boolean;
  onClose: () => void;
};

// Reusable Face card: dipakai desktop + mobile
function FaceFilterCard() {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const handler = () => {
      const maxScroll = el.scrollHeight - el.clientHeight;
      const ratio = maxScroll > 0 ? el.scrollTop / maxScroll : 0;
      setScrollRatio(ratio);
    };

    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="rounded-2xl border-[3px] md:border-[4px] border-black bg-white px-4 py-4 mb-5">
      {/* Title */}
      <p className="text-center text-sm font-bold">Face</p>

      <div className="mt-4 flex gap-3">
        {/* Scrollable list */}
        <div
          ref={listRef}
          className="
            flex-1 space-y-2 text-xs
            h-[200px] overflow-y-scroll
            scrollbar-hide
          "
        >
          {FACE_FILTER_OPTIONS.map((f, idx) => (
            <div key={`${f}-${idx}`} className="space-y-2">
              <p>{f}</p>
              <div className="h-[2px] w-full bg-black" />
            </div>
          ))}
        </div>

        {/* Custom scrollbar */}
        <div className="relative h-[180px] w-[6px] rounded-full bg-gray-200">
          <div
            className="absolute left-[1px] w-[4px] rounded-full bg-gray-400"
            style={{
              top: `${scrollRatio * (180 - 40)}px`, // 40px thumb height
              height: "40px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Desktop sidebar
 */
export default function FilterSidebar({
  onShowUnlistedClick,
  onAttributeFilterClick,
}: FilterSidebarProps) {
  return (
    <aside className="hidden md:w-60 md:block flex-shrink-0">
      <div className="flex flex-col gap-4 rounded-[32px] border-[5px] border-black bg-white p-4 py-8 shadow-cartoon">
        {/* Show unlisted */}
        <button
          type="button"
          onClick={onShowUnlistedClick}
          className="w-full rounded-2xl border-[4px] border-black bg-white px-4 py-3 text-center text-sm font-bold mb-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          Show unlisted
        </button>

        {/* Separator abu-abu di atas */}
        <div className="mb-3 h-[2px] w-full bg-gray-300" />

        {/* Face */}
        <FaceFilterCard />

        {/* Other filter buttons – versi desktop (font-bold, mb-4) */}
        {ATTRIBUTE_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            data-filter-id={filter.id}
            onClick={() => onAttributeFilterClick?.(filter.id)}
            className="w-full rounded-2xl border-[4px] border-black bg-white px-4 py-3 text-center text-sm font-bold mb-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </aside>
  );
}

/**
 * Mobile sidebar
 */
export function MobileFilterSidebar({
  open,
  onClose,
  onShowUnlistedClick,
  onAttributeFilterClick,
}: MobileFilterDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      {/* BACKDROP */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* DRAWER */}
      <div
        className="
          absolute left-0 top-0 h-full w-[58%]
          rounded-r-[32px] border-[3px] border-black bg-white
          p-4 shadow-cartoon
          z-50
          flex flex-col
        "
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Filters</span>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border-[2px] border-black bg-white shadow-cartoonTwo active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable content */}
        <div
          className="
            flex-1 overflow-y-auto pr-1
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {/* Show unlisted – versi mobile (font-semibold, mb-5) */}
          <button
            type="button"
            onClick={onShowUnlistedClick}
            className="mb-5 w-full rounded-2xl border-[3px] border-black bg-white px-4 py-3 text-center text-sm font-semibold hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          >
            Show unlisted
          </button>

          <div className="mb-5 h-[2px] w-full bg-gray-300" />

          {/* Face */}
          <FaceFilterCard />

          {/* Other filter buttons – versi mobile (font-semibold, mb-5) */}
          {ATTRIBUTE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              data-filter-id={filter.id}
              onClick={() => onAttributeFilterClick?.(filter.id)}
              className="w-full rounded-2xl border-[3.5px] border-black bg-white px-4 py-3 text-center text-sm font-semibold mb-5 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              {filter.label}
            </button>
          ))}

          <div className="h-2" />
        </div>
      </div>
    </div>
  );
}

// src/components/collect/FilterSidebar.tsx
import { useRef, useState, useEffect } from "react";

/* ----------------------- Types ----------------------- */
export type AttributesMap = Record<string, string[]>;
export type SelectedFilters = Record<string, string[]>;

interface FilterSidebarProps {
  availableTraits?: AttributesMap;
  selectedAttributes: SelectedFilters;
  onToggleAttribute: (traitType: string, value: string) => void;
  onShowUnlistedClick?: () => void;
}

type MobileFilterDrawerProps = FilterSidebarProps & {
  open: boolean;
  onClose: () => void;
};

/* ------------------ AttributeSelectorCard (list items) ------------------ */
function AttributeSelectorCard({
  traitType,
  options,
  selectedValues,
  onToggle,
  compact = false,
}: {
  traitType: string;
  options: string[];
  selectedValues: string[];
  onToggle: (val: string) => void;
  compact?: boolean; // smaller paddings for mobile if needed
}) {
  const listRef = useRef<HTMLDivElement | null>(null);
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
  }, [traitType]);

  return (
    <div className={`px-5 ${compact ? "py-3" : "py-4"} bg-white`}>
      <div className="flex gap-3">
        <div
          ref={listRef}
          className={`flex-1 space-y-3 overflow-y-auto scrollbar-hide ${compact ? "h-[180px]" : "h-[200px]"} text-xs`}
        >
          {options.length === 0 ? (
            <p className="py-4 text-center text-xs italic text-gray-400">No traits found</p>
          ) : (
            options.map((val, idx) => {
              const isSelected = selectedValues.includes(val);
              return (
                <div
                  key={`${val}-${idx}`}
                  onClick={() => onToggle(val)}
                  className="group cursor-pointer"
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className={`${isSelected ? "font-bold text-black" : "font-medium text-[#000]"}`}>
                      {val}
                    </span>
                    {isSelected && <span className="text-sm font-bold text-black">✓</span>}
                  </div>
                  <div className="h-[2px] w-full bg-[#000] group-hover:bg-black transition-colors" />
                </div>
              );
            })
          )}
        </div>

        <div className={`${compact ? "ml-1 h-[180px]" : "ml-2 h-[200px]"} w-[6px] flex-shrink-0 rounded-full bg-[#D9D9D9] relative`}>
          <div
            className="absolute w-full  bg-[#AFAFAF] transition-all duration-100 ease-out"
            style={{
              height: "40px",
              top: `${scrollRatio * ((compact ? 180 : 200) - 40)}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------ SidebarContent (shared desktop/mobile) ------------------ */
function SidebarContent({
  availableTraits = {},
  selectedAttributes,
  onToggleAttribute,
  onShowUnlistedClick,
}: FilterSidebarProps) {
  const traitKeys = Object.keys(availableTraits || {});
  const [activeTraitType, setActiveTraitType] = useState<string | null>(null);

  // keep closed by default
  useEffect(() => {}, []);

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Show unlisted (same visual as reference) 
        type="button"
        onClick={onShowUnlistedClick}
        className="w-full rounded-2xl border-[4px] border-black bg-white px-5 py-3 text-center text-sm font-black text-black"
      >
        Show unlisted
      </button>
        
      <div className="mx-1 h-[2px] bg-[#AFAFAF] opacity-80" />
*/}
      <div className="flex flex-col gap-8">
        {traitKeys.map((key) => {
          const isActive = activeTraitType === key;
          const hasActiveFilter = (selectedAttributes[key] || []).length > 0;

          return (
            <div key={key} className="relative w-full">
              <button
                type="button"
                onClick={() => setActiveTraitType((prev) => (prev === key ? null : key))}
                className={`
                  relative z-10 w-full px-4 py-3 text-sm font-black transition-all duration-100 flex items-center justify-center
                  border-4 border-black bg-white
                  ${isActive ? "rounded-t-2xl border-b-0" : "rounded-2xl hover:bg-[#FFEC40]"}
                  ${hasActiveFilter && !isActive ? "bg-gray-100" : ""}
                `}
              >
                <span className="capitalize">{key}</span>
                {hasActiveFilter && !isActive && (
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] text-black">●</span>
                )}
              </button>

              {/* merged panel: border-t-0 so no divider; -mt to overlap the stroke and remove visible seam */}
              <div
                className={`
                  overflow-hidden bg-white transition-[max-height,opacity] duration-300 ease-in
                  -mt-[2.5px]
                  ${isActive ? "max-h-[520px] border-4 border-t-0 border-black rounded-b-[20px] opacity-100 pb-3" : "max-h-0 border-0 border-transparent opacity-0"}
                `}
              >
                <AttributeSelectorCard
                  traitType={key}
                  options={availableTraits[key] || []}
                  selectedValues={selectedAttributes[key] || []}
                  onToggle={(val) => onToggleAttribute(key, val)}
                  compact={true}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------ Desktop Sidebar (kept for completeness) ------------------ */
export default function FilterSidebar(props: FilterSidebarProps) {
  return (
    <aside className="hidden md:block md:w-[230px] flex-shrink-0">
      <div
        className="relative bg-white border-[4px] border-black rounded-[28px] p-5 py-12 shadow-cartoon"
      >
        <SidebarContent {...props} />
      </div>
    </aside>
  );
}

/* ------------------ MOBILE DRAWER (updated styling) ------------------ */
export function MobileFilterSidebar({
  open,
  onClose,
  ...props
}: MobileFilterDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed min-h-screen inset-0 z-50 md:hidden">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* drawer */}
      <div
        className="
          absolute left-0 top-0 h-full w-[60%] max-w-sm
          bg-white border-[4px] border-black border-l-0 rounded-r-[32px]

          p-6
          shadow-cartoonTwo
          overflow-y-auto scrollbar-hide
        "
      >

        {/* header area */}
        <div className="flex items-center justify-end mb-6">
          {/* <h2 className="text-lg font-extrabold">Filters</h2> */}
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="flex h-8 w-8 items-center justify-center rounded-lg border-[3px] border-black bg-[#FF6467] font-bold shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ✕
          </button>
        </div>

        {/* content */}
        <SidebarContent {...props} />
      </div>
    </div>
  );
}

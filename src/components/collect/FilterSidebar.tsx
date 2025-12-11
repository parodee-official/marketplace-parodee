// src/components/collect/FilterSidebar.tsx
import { useRef, useState, useEffect } from "react";

// Tipe data untuk struktur filter
export type AttributesMap = Record<string, string[]>;
export type SelectedFilters = Record<string, string[]>;

interface FilterSidebarProps {
  /** Map dari Trait Type ke list Values (hasil ekstraksi dari NFT) */
  // UBAH KE availableTraits (Sesuai permintaan)
  availableTraits?: AttributesMap;

  /** State filter yang sedang aktif */
  selectedAttributes: SelectedFilters;

  /** Fungsi untuk mengubah filter */
  onToggleAttribute: (traitType: string, value: string) => void;

  onShowUnlistedClick?: () => void;
}

type MobileFilterDrawerProps = FilterSidebarProps & {
  open: boolean;
  onClose: () => void;
};

// --- KOMPONEN KARTU SCROLLABLE (GENERIC) ---
function AttributeSelectorCard({
  traitType,
  options,
  selectedValues,
  onToggle,
}: {
  traitType: string;
  options: string[];
  selectedValues: string[];
  onToggle: (val: string) => void;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollRatio, setScrollRatio] = useState(0);

  // Handle custom scrollbar logic
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
    <div className="rounded-2xl border-[3px] md:border-[4px] border-black bg-white px-4 py-4 mb-5 transition-all">
      <p className="text-center text-sm font-bold capitalize mb-4">{traitType}</p>

      <div className="flex gap-3">
        {/* Scrollable list */}
        <div
          ref={listRef}
          className="
            flex-1 space-y-2 text-xs
            h-[200px] overflow-y-scroll
            scrollbar-hide
          "
        >
          {options.length === 0 ? (
            <p className="text-gray-400 text-center italic">No traits found</p>
          ) : (
            options.map((val, idx) => {
              const isSelected = selectedValues.includes(val);
              return (
                <div
                  key={`${val}-${idx}`}
                  className="cursor-pointer group"
                  onClick={() => onToggle(val)}
                >
                  <div className="flex items-center justify-between py-1">
                    <span className={isSelected ? "font-bold text-black" : "text-gray-600"}>
                      {val}
                    </span>
                    {isSelected && <span className="text-green-600 font-bold">✓</span>}
                  </div>
                  <div className={`h-[2px] w-full transition-colors ${isSelected ? "bg-black" : "bg-gray-200 group-hover:bg-gray-400"}`} />
                </div>
              );
            })
          )}
        </div>

        {/* Custom scrollbar track */}
        <div className="relative h-[200px] w-[6px] rounded-full bg-gray-200 flex-shrink-0">
          <div
            className="absolute left-[1px] w-[4px] rounded-full bg-black transition-all duration-75"
            style={{
              top: `${scrollRatio * (200 - 40)}px`,
              height: "40px",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Shared Content untuk Desktop & Mobile
 */
function SidebarContent({
  // BERI DEFAULT VALUE {} AGAR TIDAK ERROR "UNDEFINED"
  availableTraits = {},
  selectedAttributes,
  onToggleAttribute,
  onShowUnlistedClick,
}: FilterSidebarProps) {

  // Gunakan availableTraits di sini
  // Tambahkan safety check || {}
  const traitKeys = Object.keys(availableTraits || {});

  const [activeTraitType, setActiveTraitType] = useState<string | null>(null);

  // Set default active tab jika belum ada yang aktif dan data tersedia
  useEffect(() => {
    if (!activeTraitType && traitKeys.length > 0) {
      setActiveTraitType(traitKeys[0]);
    }
  }, [traitKeys, activeTraitType]);

  return (
    <>
      <button
        type="button"
        onClick={onShowUnlistedClick}
        className="w-full rounded-2xl border-[3px] md:border-[4px] border-black bg-white px-4 py-3 text-center text-sm font-bold mb-4 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-transform"
      >
        Show unlisted
      </button>

      <div className="mb-3 h-[2px] w-full bg-gray-300" />

      {traitKeys.length === 0 && (
        <div className="text-center text-xs text-gray-400 py-10">No attributes found</div>
      )}

      {/* 1. KARTU DETAIL */}
      {activeTraitType && (
        <AttributeSelectorCard
          traitType={activeTraitType}
          // Gunakan availableTraits
          options={availableTraits[activeTraitType] || []}
          selectedValues={selectedAttributes[activeTraitType] || []}
          onToggle={(val) => onToggleAttribute(activeTraitType, val)}
        />
      )}

      {/* 2. LIST BUTTON KATEGORI */}
      <div className="space-y-3">
        {traitKeys.map((key) => {
          const isActive = activeTraitType === key;
          const hasActiveFilter = (selectedAttributes[key] || []).length > 0;

          return (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTraitType(key)}
              className={`
                w-full rounded-2xl border-[3px] md:border-[4px] border-black px-4 py-3 text-center text-sm font-bold
                hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all
                ${isActive ? "bg-black text-white" : "bg-white text-black"}
                ${hasActiveFilter && !isActive ? "bg-gray-100 ring-2 ring-gray-300" : ""}
              `}
            >
              {key} {hasActiveFilter && <span className="ml-1 text-xs">●</span>}
            </button>
          );
        })}
      </div>
    </>
  );
}

/**
 * Desktop Sidebar
 */
export default function FilterSidebar(props: FilterSidebarProps) {
  return (
    <aside className="hidden md:w-60 md:block flex-shrink-0">
      <div className="flex flex-col gap-2 rounded-[32px] border-[5px] border-black bg-white p-4 py-8 shadow-cartoon">
        <SidebarContent {...props} />
      </div>
    </aside>
  );
}

/**
 * Mobile Sidebar
 */
export function MobileFilterSidebar({
  open,
  onClose,
  ...props
}: MobileFilterDrawerProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute left-0 top-0 h-full w-[65%] rounded-r-[32px] border-[3px] border-black bg-white p-4 shadow-cartoon z-50 flex flex-col">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-semibold">Filters</span>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg border-[2px] border-black bg-white shadow-cartoonTwo active:translate-x-1 active:translate-y-1 active:shadow-none"
          >
            ✕
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto pr-1 pb-10 scrollbar-hide">
           <SidebarContent {...props} />
        </div>
      </div>
    </div>
  );
}

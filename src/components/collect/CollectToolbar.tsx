"use client";

export type SortMode = "featured" | "newest" | "rarity";

type CollectToolbarProps = {
  search: string;
  onSearchChange: (v: string) => void;
  onOpenFilter?: () => void;

  sortMode?: SortMode;
  onSortModeChange?: (mode: SortMode) => void;

  onOpenSortMenu?: () => void;
};

export default function CollectToolbar({
  search,
  onSearchChange,
  onOpenFilter,
  sortMode = "featured",
  onSortModeChange,
  onOpenSortMenu,
}: CollectToolbarProps) {

  const handleSortClick = (mode: SortMode) => {
    if (mode === sortMode) return;
    onSortModeChange?.(mode);
  };

  return (
    <div className="mb-10 flex  items-center gap-4 sm:gap-5">

      {/* Filter icon – mobile only */}
      <button
        type="button"
        onClick={() => onOpenFilter?.()}
        className="flex h-9 w-9 flex-none items-center justify-center rounded-lg border-[3px] border-black bg-white shadow-[4px_4px_0_rgba(0,0,0,1)] md:hidden active:translate-x-1 active:translate-y-1 active:shadow-none"
        aria-label="Open filters"
      >
        <div className="flex flex-col gap-[3px]">
          <span className="block h-[2px] w-5 bg-black" />
          <span className="block h-[2px] w-3 bg-black" />
          <span className="block h-[2px] w-4 bg-black" />
        </div>
      </button>

      {/* Search bar — unchanged */}
      <div className="w-full flex-1 min-w-[200px] sm:min-w-[250px]">
        <div className="flex items-center rounded-[20px] border-[3px] md:border-[4px] border-black bg-white px-3 py-1 md:py-2 sm:px-4 shadow-[4px_4px_0_rgba(0,0,0,1)] md:shadow-cartoon hover:-translate-x-0.5 hover:-translate-y-0.5">
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search item, traits..."
            className="mr-2 flex-1 border-none bg-transparent text-xs sm:text-sm outline-none placeholder:text-gray-400"
          />
          <button
            type="button"
            className="flex h-6 md:h-7 w-6 md:w-7 flex-none items-center justify-center rounded-full border-2 border-black shadow-[2px_2px_0_rgba(0,0,0,1)]"
          >
            <img
                src="/icon/arrow-next.svg"
                alt="arrow"
                className="h-4 w-4"
              />
            {/* <span className="block h-[2px] w-3 rotate-45 translate-x-[1px] translate-y-[1px] bg-black" /> */}
          </button>
        </div>
      </div>

      {/* Sort icons kotak bulat segitiga
      <div className="ml-2 md:ml-5 flex flex-none items-center gap-2 md:gap-3 pt-1 sm:pt-0">


        <button
          type="button"
          aria-label="Sort by featured"
          aria-pressed={sortMode === "featured"}
          onClick={() => handleSortClick("featured")}
          className="flex h-6 md:h-8 w-6 md:w-8 items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-1 active:translate-x-1"
        >
          <div
            className={[
              "h-5 md:h-7 w-5 md:w-7 rounded-[3px] border-[2.5px] md:border-[3px] border-black",
              sortMode === "featured" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          />
        </button>


        <button
          type="button"
          aria-label="Sort by newest"
          aria-pressed={sortMode === "newest"}
          onClick={() => handleSortClick("newest")}
          className="flex h-6 md:h-8 w-6 md:w-8  items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-1 active:translate-x-1"
        >
          <div
            className={[
              "h-5 md:h-7 w-5 md:w-7 rounded-full border-[2.5px] md:border-[3px] border-black",
              sortMode === "newest" ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          />
        </button>


        <button
          type="button"
          aria-label="Open sort menu"
          aria-pressed={sortMode === "rarity"}
          onClick={() => onOpenSortMenu?.()}
          className="flex h-6 md:h-8 w-6 md:w-8 items-center justify-center hover:translate-x-[1px] hover:translate-y-[1px] active:translate-y-1 active:translate-x-1 "
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 md:h-8 w-6 md:w-8"
          >
            <path
              d="M4 20 L12 4 L20 20 Z"
              className={[
                "stroke-black",
                "transition",
                sortMode === "rarity" ? "fill-brand-yellow" : "fill-white",
              ].join(" ")}
              strokeWidth={1.8}
            />
          </svg>
        </button>


      </div>*/}
    </div>
  );
}

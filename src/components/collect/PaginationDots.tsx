// src/components/collect/PaginationDots.tsx
"use client";

type PaginationDotsProps = {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
};

export default function PaginationDots({
  currentPage,
  totalPages,
  onChange,
}: PaginationDotsProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onChange(page);
  };

  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {/* Prev */}
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold shadow-cartoon",
          currentPage === 1 && "opacity-40 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {"<"}
      </button>

      {/* Pages */}
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            className={[
              "flex h-7 w-7 items-center justify-center rounded-full border-2 border-black text-xs font-bold shadow-cartoonTwo",
              isActive ? "bg-brand-yellow" : "bg-white",
            ].join(" ")}
          >
            {p}
          </button>
        );
      })}

      {/* Next */}
      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={[
          "flex h-7 w-7 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold shadow-cartoonTwo",
          currentPage === totalPages && "opacity-40 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {">"}
      </button>
    </div>
  );
}

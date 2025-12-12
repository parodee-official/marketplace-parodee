"use client";
import Image from "next/image";

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

  // Jumlah maksimal halaman yang tampil di pager
  const MAX_VISIBLE_PAGES = 5;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onChange(page);
  };

  /**
   * Sliding window:
   * - Jika totalPages <= MAX_VISIBLE_PAGES: tampilkan semua.
   * - Jika currentPage berada di awal: tampilkan 1..MAX_VISIBLE_PAGES.
   * - Jika currentPage berada di akhir: tampilkan totalPages-MAX+1 .. totalPages.
   * - Jika memungkinkan, center currentPage di tengah window.
   */
  const getPageNumbers = () => {
    if (totalPages <= MAX_VISIBLE_PAGES) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(MAX_VISIBLE_PAGES / 2);

    let start = currentPage - half;
    let end = currentPage + (MAX_VISIBLE_PAGES - half - 1);

    // adjust if start < 1
    if (start < 1) {
      start = 1;
      end = MAX_VISIBLE_PAGES;
    }

    // adjust if end > totalPages
    if (end > totalPages) {
      end = totalPages;
      start = totalPages - MAX_VISIBLE_PAGES + 1;
      if (start < 1) start = 1;
    }

    const pages = [];
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {/* Prev */}
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-black bg-white text-sm font-bold transition-transform active:scale-95",
          "shadow-[2px_2px_0px_#000000]",
          currentPage === 1 && "opacity-40 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Previous page"
      >
        <Image
          src="/icon/arrow-prev.svg"
          alt="Previous page"
          width={14}
          height={14}
          className="object-contain pointer-events-none"
        />
      </button>

      {/* Page numbers (sliding window) */}
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-black text-xs font-bold transition-transform active:scale-95",
              "shadow-[2px_2px_0px_#000000]",
              isActive ? "bg-brand-yellow" : "bg-white hover:bg-gray-50",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-label={`Page ${p}`}
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
          "flex h-9 w-9 items-center justify-center rounded-full border-[3px] border-black bg-white text-sm font-bold transition-transform active:scale-95",
          "shadow-[2px_2px_0px_#000000]",
          currentPage === totalPages && "opacity-40 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
        aria-label="Next page"
      >
        <Image
          src="/icon/arrow-next.svg"
          alt="Next page"
          width={14}
          height={14}
          className="object-contain pointer-events-none"
        />
      </button>
    </div>
  );
}

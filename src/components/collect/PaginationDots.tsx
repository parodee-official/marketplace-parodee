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

  const MAX_VISIBLE_PAGES = 5;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages) return;
    onChange(page);
  };

  // Logic Sliding Window (Selalu ambil 10 halaman)
  const getPageNumbers = () => {
    // 1. Tentukan startPage berdasarkan currentPage
    let startPage = currentPage;

    // 2. Tentukan endPage (start + 9) agar totalnya 10 item
    let endPage = startPage + MAX_VISIBLE_PAGES - 1;

    // 3. Handle jika endPage melebihi totalPages
    if (endPage > totalPages) {
      endPage = totalPages;
      // Geser startPage ke belakang supaya tetap menampilkan 10 item (jika cukup)
      startPage = Math.max(1, endPage - MAX_VISIBLE_PAGES + 1);
    }

    // 4. Buat array angka
    const pages = [];
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
      {/* Tombol Prev */}
      <button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold shadow-cartoon transition-transform active:scale-95",
          currentPage === 1 && "opacity-40 pointer-events-none",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {"<"}
      </button>

      {/* Loop Angka Halaman (Max 10 item) */}
      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            onClick={() => goTo(p)}
            className={[
              "flex h-8 w-8 items-center justify-center rounded-full border-2 border-black text-xs font-bold shadow-cartoonTwo transition-transform active:scale-95",
              isActive ? "bg-brand-yellow" : "bg-white hover:bg-gray-50",
            ].join(" ")}
          >
            {p}
          </button>
        );
      })}

      {/* Tombol Next */}
      <button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={[
          "flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-sm font-bold shadow-cartoon transition-transform active:scale-95",
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

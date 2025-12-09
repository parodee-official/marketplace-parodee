// src/app/collect/page.tsx
"use client";

import { useMemo, useState } from "react";
import { collectibles } from "@/data/collectibles";
import type { Collectible } from "@/types/collectible";
import CollectToolbar, { SortMode } from "@/components/collect/CollectToolbar";
import CollectGrid from "@/components/collect/CollectGrid";
import PaginationDots from "@/components/collect/PaginationDots";
import CollectItemModal from "@/components/collect/CollectItemModal";
import FilterSidebar, {
  MobileFilterSidebar,
} from "@/components/collect/FilterSidebar";
import SortModal, {
  SortDirection,
  SortOptionId,
} from "@/components/collect/SortModal";

const ITEMS_PER_PAGE = 25;

export default function CollectPage() {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  const [selectedItem, setSelectedItem] = useState<Collectible | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("best-offer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const filtered: Collectible[] = useMemo(() => {
    const q = search.trim().toLowerCase();

    // 1) filter by search
    const base = !q
      ? collectibles
      : collectibles.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.collection.toLowerCase().includes(q),
        );

    // 2) apply sort mode (pakai name supaya dijamin kerasa)
    if (sortMode === "featured") {
      return base;
    }

    const sorted = [...base];

    if (sortMode === "newest") {
      // contoh: A → Z
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortMode === "rarity") {
      // contoh: Z → A
      sorted.sort((a, b) => b.name.localeCompare(a.name));
    }

    if (sortDirection === "desc") {
      sorted.reverse();
    }

    return sorted;
  }, [search, sortMode, sortDirection]);

  // pagination calc
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

  const handleOpenItem = (item: Collectible) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
  };

  const handleCloseItem = () => {
    setIsItemModalOpen(false);
  };

  // clamp current page kalau filter/search berubah dan page-nya jadi di luar range
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, endIndex);

  // mapping dari opsi modal ke SortMode yang existing
  const applySortOption = (opt: SortOptionId) => {
    setSortOption(opt);

    switch (opt) {
      case "best-offer":
        setSortMode("featured");
        break;
      case "last-sale":
        setSortMode("newest");
        break;
      case "rarity":
        setSortMode("rarity");
        break;
      case "time-listed":
        setSortMode("newest");
        break;
      default:
        setSortMode("featured");
    }

    setCurrentPage(1);
  };

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex gap-6">
        {/* Sidebar (desktop) */}
        <FilterSidebar />

        {/* Right content */}
        <div className="flex-1">
          <CollectToolbar
            search={search}
            onSearchChange={(v) => {
              setSearch(v);
              setCurrentPage(1);
            }}
            onOpenFilter={() => setIsMobileFilterOpen(true)}
            sortMode={sortMode}
            onSortModeChange={(mode) => {
              setSortMode(mode);
              setCurrentPage(1);
            }}
            onOpenSortMenu={() => setIsSortModalOpen(true)}
          />

          <CollectGrid items={pageItems} onItemClick={handleOpenItem} />

          <PaginationDots
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Mobile filter drawer */}
      <MobileFilterSidebar
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />

      {/* Modal detail + connect wallet gate */}
      <CollectItemModal
        open={isItemModalOpen}
        item={selectedItem}
        onClose={handleCloseItem}
      />

      {/* Sort modal (triggered by triangle button) */}
      <SortModal
        open={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        option={sortOption}
        direction={sortDirection}
        onChangeOption={applySortOption}
        onChangeDirection={(dir) => {
          setSortDirection(dir);
          setCurrentPage(1);
        }}
      />
    </section>
  );
}

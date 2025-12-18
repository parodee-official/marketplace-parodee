// src/components/collect/CollectPageClient.tsx
"use client";

import { useMemo, useState } from "react";
import CollectToolbar, { SortMode } from "@/components/collect/CollectToolbar";
import CollectGrid from "@/components/collect/CollectGrid";
import PaginationDots from "@/components/collect/PaginationDots";
import CollectItemModal from "@/components/collect/CollectItemModal";
import FilterSidebar, { MobileFilterSidebar } from "@/components/collect/FilterSidebar";
import SortModal, { SortDirection, SortOptionId } from "@/components/collect/SortModal";
import { getNFTEventsAction } from "@/app/actions/nftActions";

const ITEMS_PER_PAGE = 25;

// [PENTING] Masukkan Contract Address Collection Anda di sini
const CONTRACTS: Record<string, string> = {
  "parodee-pixel-chaos": "0x9e1dadf6eb875cf927c85a430887f2945039f923",
  "parodee-hyperevm": "0x90df79459afc5fc58b7bfdca3c27c18b03a29d66",
};
const CHAINS: Record<string, string> = {
  "parodee-pixel-chaos": "ethereum",
  "parodee-hyperevm": "hyperevm", // Slug khusus HyperEVM di OpenSea
};
const ALLOWED_TRAIT_TYPES = ["Background", "Body", "Type", "Face", "Outfit"];

type CollectPageClientProps = {
  initialItems: any[];
  activeSlug: string; // <-- Tambahkan prop ini
};

export default function CollectPageClient({ initialItems, activeSlug }: CollectPageClientProps) {
  //kalo slug nggak ada di CONTRACTS, default ke pixel-chaos
  const currentContract = CONTRACTS[activeSlug] || CONTRACTS["parodee-pixel-chaos"];
  const currentChain = CHAINS[activeSlug] || "ethereum"; // Default ke ethereum
  // 1. Data langsung pakai dari props (JSON Lokal), tidak perlu state 'items' tambahan
  const items = initialItems;

  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // State Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
{/*
  // State Sort
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("best-offer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
*/}
  // 2. Extract Traits dari JSON Lokal (key: 'attributes')
  const availableTraits = useMemo(() => {
    const traitsMap: Record<string, Set<string>> = {};

    for (const item of items) {
      const rawTraits = item.attributes || []; // <-- Pakai attributes
      if (!Array.isArray(rawTraits)) continue;

      for (const t of rawTraits) {
        const traitType = t.trait_type; // <-- Pakai trait_type
        if (!traitType) continue;

        const normalizedType = String(traitType).charAt(0).toUpperCase() + String(traitType).slice(1);

        if (ALLOWED_TRAIT_TYPES.includes(normalizedType)) {
          if (!traitsMap[normalizedType]) {
            traitsMap[normalizedType] = new Set();
          }
          traitsMap[normalizedType].add(String(t.value));
        }
      }
    }

    const result: Record<string, string[]> = {};
    for (const key in traitsMap) {
      result[key] = Array.from(traitsMap[key]).sort();
    }
    return result;
  }, [items]);

  // 3. Filter Logic
  const filtered = useMemo(() => {
    let result = [...items];

    // Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item: any) => {
        const name = (item.name ?? "").toLowerCase();
        const id = String(item.identifier ?? "").toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    // Attributes Filter
    if (Object.keys(selectedAttributes).length > 0) {
      result = result.filter((item: any) => {
        const itemTraits = item.attributes || []; // <-- Pakai attributes
        return Object.entries(selectedAttributes).every(([filterCategory, filterValues]) => {
          if (filterValues.length === 0) return true;
          return itemTraits.some((t: any) => {
            const tType = t.trait_type; // <-- Pakai trait_type
            const normType = String(tType).charAt(0).toUpperCase() + String(tType).slice(1);
            return normType === filterCategory && filterValues.includes(String(t.value));
          });
        });
      });
    }
    /*}
    // Sort
    if (sortMode === "newest") {
       result.sort((a, b) => parseInt(b.identifier) - parseInt(a.identifier));
    } else if (sortMode === "rarity") {
       result.sort((a, b) => String(b.name ?? "").localeCompare(String(a.name ?? "")));
    } else {
       // Featured / Default: Sort by ID Ascending
       result.sort((a, b) => parseInt(a.identifier) - parseInt(b.identifier));
    }
       

    if (sortDirection === "desc") result.reverse();
  */
    return result;
  }, [items, search, selectedAttributes]);
  /*[items, search, sortMode, sortDirection, selectedAttributes]);*/

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  // Handlers
  const handleToggleAttribute = (traitType: string, value: string) => {
    setSelectedAttributes((prev) => {
      const current = prev[traitType] || [];
      const newValues = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      const next = { ...prev };
      if (newValues.length === 0) delete next[traitType];
      else next[traitType] = newValues;
      return next;
    });
    setCurrentPage(1);
  };

  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);
    setHistory([]);
    setIsLoadingDetail(true);

    try {
      // 4. Update Action Call: Gunakan 'currentChain' (hyperevm/ethereum)
      // Ini penting agar API OpenSea mencari di network yang benar
      const historyData = await getNFTEventsAction(
          currentChain, // <-- GANTI CONSTANT JADI VARIABLE
          currentContract,
          item.identifier
      );

      if (historyData && historyData.asset_events) {
          setHistory(historyData.asset_events);
      }
    } catch (error) {
      console.error("Gagal fetch history:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };
  /*
  const applySortOption = (opt: SortOptionId) => {
    setSortOption(opt);
    setSortMode(opt === "best-offer" ? "featured" : opt === "rarity" ? "rarity" : "newest");
    setCurrentPage(1);
  };
  */
  return (
    <section className="mt-4 md:mt-6">
      <div className="flex gap-10">
        <FilterSidebar
          availableTraits={availableTraits}
          selectedAttributes={selectedAttributes}
          onToggleAttribute={handleToggleAttribute}
        />

        <div className="flex-1">
          <CollectToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
            onOpenFilter={() => setIsMobileFilterOpen(true)}
            /*sortMode={sortMode}
            onSortModeChange={(mode) => { setSortMode(mode); setCurrentPage(1); }}
            onOpenSortMenu={() => setIsSortModalOpen(true)}*/
          />

          <CollectGrid items={pageItems} onItemClick={handleOpenItem} />

          <PaginationDots currentPage={safePage} totalPages={totalPages} onChange={setCurrentPage} />
        </div>
      </div>

      <MobileFilterSidebar
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        availableTraits={availableTraits}
        selectedAttributes={selectedAttributes}
        onToggleAttribute={handleToggleAttribute}
      />

      <CollectItemModal
        open={isItemModalOpen}
        item={selectedItem}
        detail={{
            ...selectedItem,
            contract: currentContract,
            chain: currentChain  // <-- INI KUNCINYA
        }}
        history={history}
        isLoading={isLoadingDetail}
        onClose={() => setIsItemModalOpen(false)}
      />
      {/*
      <SortModal
        open={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        option={sortOption}
        direction={sortDirection}
        onChangeOption={applySortOption}
        onChangeDirection={(dir) => { setSortDirection(dir); setCurrentPage(1); }}
      />
      */}
    </section>
  );
}

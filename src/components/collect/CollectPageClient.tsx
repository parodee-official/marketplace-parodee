// src/components/collect/CollectPageClient.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import CollectToolbar, { SortMode } from "@/components/collect/CollectToolbar";
import CollectGrid from "@/components/collect/CollectGrid";
import PaginationDots from "@/components/collect/PaginationDots";
import CollectItemModal from "@/components/collect/CollectItemModal";
import FilterSidebar, { MobileFilterSidebar } from "@/components/collect/FilterSidebar";
import SortModal, { SortDirection, SortOptionId } from "@/components/collect/SortModal";
import { getNFTDetailsAction, getNFTEventsAction } from "@/app/actions/nftActions";

const ITEMS_PER_PAGE = 25;

// --- CONFIG: HANYA TAMPILKAN KATEGORI INI ---
const ALLOWED_TRAIT_TYPES = ["Background", "Body", "Type", "Face", "Outfit"];

type CollectPageClientProps = {
  initialItems: any;
};

export default function CollectPageClient({ initialItems }: CollectPageClientProps) {

  // 1. NORMALISASI AWAL
  const baseItems = useMemo(() => {
    if (!initialItems) return [];
    if (Array.isArray(initialItems)) return initialItems;
    if (initialItems.nfts && Array.isArray(initialItems.nfts)) return initialItems.nfts;
    return [];
  }, [initialItems]);

  // State untuk menyimpan item yang sudah dilengkapi traits
  const [items, setItems] = useState<any[]>(baseItems);

  // --- 2. AUTO-ENRICH (Ambil Traits di Background) ---
  useEffect(() => {
    // Jika tidak ada items atau item pertama sudah punya traits, stop.
    if (items.length === 0 || (items[0]?.traits && items[0].traits.length > 0)) {
        return;
    }

    const enrichData = async () => {
      // Copy array state saat ini
      const updatedItems = [...baseItems];
      const limit = Math.min(updatedItems.length, 30); // Ambil 30 item pertama dulu

      for (let i = 0; i < limit; i++) {
        const item = updatedItems[i];
        if (item.traits && item.traits.length > 0) continue;

        try {
          const chain = item.chain || "ethereum";
          const address = typeof item.contract === 'object' ? item.contract.address : item.contract;
          const identifier = item.identifier;

          // Ambil detail lengkap
          const detail = await getNFTDetailsAction(chain, address, identifier);

          if (detail && detail.nft && detail.nft.traits) {
            updatedItems[i] = { ...item, traits: detail.nft.traits };

            // Update UI setiap 5 item agar terasa progresif
            if (i % 5 === 0) {
                setItems([...updatedItems]);
            }
          }
        } catch (err) {
          console.warn(`Skip item ${i}`, err);
        }
      }
      // Final update
      setItems([...updatedItems]);
    };

    enrichData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseItems]);


  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string[]>>({});

  // State Modal
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  const [detailItem, setDetailItem] = useState<any | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  // State Sort
  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("best-offer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // --- 3. FILTERING LOGIC (PERBAIKAN UTAMA) ---
  // Kita extract traits HANYA dari kategori yang diizinkan (Allowed Traits)
  const availableTraits = useMemo(() => {
  const traitsMap: Record<string, Set<string>> = {};

  // Gunakan for...of loop yang lebih cepat dari forEach untuk array besar
  for (const item of items) {
    const rawTraits = item.traits || item.metadata?.attributes || [];
    if (!Array.isArray(rawTraits)) continue;

    for (const t of rawTraits) {
      const traitType = t.trait_type || t.key;
      if (!traitType) continue; // Skip jika kosong

      // Normalisasi
      const normalizedType = String(traitType).charAt(0).toUpperCase() + String(traitType).slice(1);

      // Cek Whitelist SEBELUM memproses logic lain (Short-circuit)
      if (ALLOWED_TRAIT_TYPES.includes(normalizedType)) {
        if (!traitsMap[normalizedType]) {
          traitsMap[normalizedType] = new Set();
        }
        // Pastikan value string
        traitsMap[normalizedType].add(String(t.value));
      }
    }
  }

  // Convert Set ke Array
  const result: Record<string, string[]> = {};
  for (const key in traitsMap) { // Gunakan for...in
     // Spread operator [...] pada Set kadang lambat di engine lama, Array.from lebih aman
     result[key] = Array.from(traitsMap[key]).sort();
  }

  return result;
}, [items]); // Dependency array aman


  // --- 4. APPLY FILTER KE GRID ---
  const filtered = useMemo(() => {
    // PENTING: Gunakan 'items' (state yang sudah di-enrich), BUKAN 'initialItems'
    let result = [...items];

    // A. Search
    const q = search.trim().toLowerCase();
    if (q) {
      result = result.filter((item: any) => {
        const name = (item.name ?? "").toLowerCase();
        const id = String(item.identifier ?? "").toLowerCase();
        return name.includes(q) || id.includes(q);
      });
    }

    // B. Attributes Filter
    if (Object.keys(selectedAttributes).length > 0) {
      result = result.filter((item: any) => {
        // Ambil traits dari item ini
        const itemTraits = item.traits || item.metadata?.attributes || [];

        // Cek setiap filter yang aktif (Logic AND antar kategori)
        return Object.entries(selectedAttributes).every(([filterCategory, filterValues]) => {
          if (filterValues.length === 0) return true;

          // Item harus punya salah satu value dari filterValues di kategori ini
          return itemTraits.some((t: any) => {
            const tType = t.trait_type || t.key;
            // Normalisasi nama kategori biar cocok (background -> Background)
            const normType = String(tType).charAt(0).toUpperCase() + String(tType).slice(1);

            // Cek apakah Tipe cocok DAN Value cocok
            return normType === filterCategory && filterValues.includes(String(t.value));
          });
        });
      });
    }

    // C. Sort
    if (sortMode !== "featured") {
      if (sortMode === "newest") {
        result.sort((a, b) => String(a.name ?? "").localeCompare(String(b.name ?? "")));
      } else if (sortMode === "rarity") {
        result.sort((a, b) => String(b.name ?? "").localeCompare(String(a.name ?? "")));
      }
    }
    if (sortDirection === "desc") result.reverse();

    return result;
  }, [items, search, sortMode, sortDirection, selectedAttributes]);

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
    setDetailItem(null);
    setHistory([]);
    setIsLoadingDetail(true);

    try {
      const chain = item.chain || "ethereum";
      const address = typeof item.contract === 'object' ? item.contract.address : item.contract;
      const identifier = item.identifier;

      const [detailData, historyData] = await Promise.all([
        getNFTDetailsAction(chain, address, identifier),
        getNFTEventsAction(chain, address, identifier)
      ]);

      if (detailData && detailData.nft) setDetailItem(detailData.nft);
      if (historyData && historyData.asset_events) setHistory(historyData.asset_events);
    } catch (error) {
      console.error("Gagal detail:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const applySortOption = (opt: SortOptionId) => {
    setSortOption(opt);
    setSortMode(opt === "best-offer" ? "featured" : opt === "rarity" ? "rarity" : "newest");
    setCurrentPage(1);
  };

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex gap-6">
        <FilterSidebar
          availableTraits={availableTraits} // <-- Nama prop harus sama dengan di FilterSidebar
          selectedAttributes={selectedAttributes}
          onToggleAttribute={handleToggleAttribute}
        />

        <div className="flex-1">
          <CollectToolbar
            search={search}
            onSearchChange={(v) => { setSearch(v); setCurrentPage(1); }}
            onOpenFilter={() => setIsMobileFilterOpen(true)}
            sortMode={sortMode}
            onSortModeChange={(mode) => { setSortMode(mode); setCurrentPage(1); }}
            onOpenSortMenu={() => setIsSortModalOpen(true)}
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
        detail={detailItem}
        history={history}
        isLoading={isLoadingDetail}
        onClose={() => setIsItemModalOpen(false)}
      />

      <SortModal
        open={isSortModalOpen}
        onClose={() => setIsSortModalOpen(false)}
        option={sortOption}
        direction={sortDirection}
        onChangeOption={applySortOption}
        onChangeDirection={(dir) => { setSortDirection(dir); setCurrentPage(1); }}
      />
    </section>
  );
}

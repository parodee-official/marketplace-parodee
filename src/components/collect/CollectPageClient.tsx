// src/components/collect/CollectPageClient.tsx
"use client";

import { useMemo, useState } from "react";
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
// Import client opensea
import { openSeaClient } from "@/lib/opensea";
import { getNFTDetailsAction, getNFTEventsAction } from "@/app/actions/nftActions";

const ITEMS_PER_PAGE = 25;

type CollectPageClientProps = {
  initialItems: any[]; // array NFT dari OpenSea
};

export default function CollectPageClient({ initialItems }: CollectPageClientProps) {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // State untuk Modal & Detail Data
  const [selectedItem, setSelectedItem] = useState<any | null>(null); // Data dasar dari Grid
  const [detailItem, setDetailItem] = useState<any | null>(null);     // Data lengkap (Attributes, dll)
  const [history, setHistory] = useState<any[]>([]);                  // Data history transaksi
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);      // Loading state untuk fetch detail
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);

  const [sortMode, setSortMode] = useState<SortMode>("featured");
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOptionId>("best-offer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // FILTER + SORT (client-side)
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = !q
      ? initialItems
      : initialItems.filter((item: any) => {
          const name = (item.name ?? "").toLowerCase();
          const id = String(item.identifier ?? "").toLowerCase();
          const collection = String(item.collection ?? "").toLowerCase();
          return name.includes(q) || id.includes(q) || collection.includes(q);
        });

    if (sortMode === "featured") return base;

    const sorted = [...base];

    if (sortMode === "newest") {
      sorted.sort((a, b) =>
        String(a.name ?? "").localeCompare(String(b.name ?? ""))
      );
    } else if (sortMode === "rarity") {
      sorted.sort((a, b) =>
        String(b.name ?? "").localeCompare(String(a.name ?? ""))
      );
    }

    if (sortDirection === "desc") sorted.reverse();

    return sorted;
  }, [initialItems, search, sortMode, sortDirection]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageItems = filtered.slice(startIndex, endIndex);

  // LOGIKA UTAMA: Fetch Detail saat Item di-klik
  const handleOpenItem = async (item: any) => {
    setSelectedItem(item);
    setIsItemModalOpen(true);

    setDetailItem(null);
    setHistory([]);
    setIsLoadingDetail(true);

    try {
      const chain = item.chain || "ethereum";
      const address = item.contract;
      // Handle jika item.contract adalah object (kadang API v2 mengembalikan object address)
      const contractAddress = typeof address === 'object' ? address.address : address;
      const identifier = item.identifier;

      // 2. GUNAKAN SERVER ACTION DI SINI
      const [detailData, historyData] = await Promise.all([
        getNFTDetailsAction(chain, contractAddress, identifier),
        getNFTEventsAction(chain, contractAddress, identifier)
      ]);

      // 3. Update state (tambahkan pengecekan null safety)
      if (detailData && detailData.nft) {
        setDetailItem(detailData.nft);
      }

      if (historyData && historyData.asset_events) {
        setHistory(historyData.asset_events);
      }

    } catch (error) {
      console.error("Gagal mengambil detail NFT:", error);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleCloseItem = () => {
    setIsItemModalOpen(false);
    // Opsional: Reset detail saat tutup agar bersih saat dibuka lagi
    // setSelectedItem(null);
  };

  const applySortOption = (opt: SortOptionId) => {
    setSortOption(opt);

    switch (opt) {
      case "best-offer":
        setSortMode("featured");
        break;
      case "last-sale":
      case "time-listed":
        setSortMode("newest");
        break;
      case "rarity":
        setSortMode("rarity");
        break;
      default:
        setSortMode("featured");
    }

    setCurrentPage(1);
  };

  return (
    <section className="mt-4 md:mt-6">
      <div className="flex gap-6">
        <FilterSidebar />

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

      <MobileFilterSidebar
        open={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
      />

      {/* Update props ke Modal: Kirim data detail, history, dan status loading */}
      <CollectItemModal
        open={isItemModalOpen}
        item={selectedItem}      // Data dasar (Image, Name)
        detail={detailItem}      // Data lengkap (Attributes) - Perlu diupdate di komponen Modal
        history={history}        // Data events - Perlu diupdate di komponen Modal
        isLoading={isLoadingDetail} // Status loading untuk menampilkan spinner di Modal
        onClose={handleCloseItem}
      />

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

// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletId } from "thirdweb/wallets";

const COLLECTION_CONTRACT = "0x9e1dadf6eb875cf927c85a430887f2945039f923"; // Ganti dengan punya Anda
type CollectItemModalProps = {
  open: boolean;
  onClose: () => void;
  item: any | null;
  detail?: any;
  history?: any[];
  isLoading?: boolean;
  floorPriceEth?: number | null;
};

type DetailTab = "attributes" | "activity" | "bids";

const DETAIL_TABS: { id: DetailTab; label: string }[] = [
  { id: "attributes", label: "Attributes" },
  { id: "activity", label: "Activity" },
  { id: "bids", label: "Bids" },
];

const WALLET_OPTIONS: { label: string; id: WalletId }[] = [
  // MetaMask biasanya punya Extension, jadi aman pakai ID spesifik
  { label: "MetaMask", id: "io.metamask" },

  // WalletConnect (Generic) -> INI PALING STABIL UNTUK QR
  { label: "WalletConnect", id: "walletConnect" },

  // --- PERBAIKAN DI SINI ---
  // Ubah ID OKX & Coinbase menjadi 'walletConnect' jika target utamanya adalah Scan QR.
  // Ini akan memaksa sistem menyimpan session data.
  { label: "Coinbase Wallet", id: "walletConnect" },
  { label: "Phantom", id: "app.phantom" }, // Phantom biasanya deteksi extension dgn baik
  { label: "OKX Wallet", id: "walletConnect" }, // <--- GANTI INI DARI 'com.okex.wallet' KE 'walletConnect'

  { label: "Others", id: "walletConnect" },
];


// Helper untuk menyingkat address (misal: 0x3256)
const shortenAddress = (addr: string) => {
  if (!addr) return "-";
  if (addr.length < 8) return addr;
  return addr.substring(0, 6);
};


export default function CollectItemModal({
  open,
  onClose,
  item,
  detail,
  history,
  isLoading = false,
}: CollectItemModalProps) {
  const { isConnected, connect, isConnecting } = useWallet();

  const [activeTab, setActiveTab] = useState<DetailTab>("attributes");
  const [isConnectingLocal, setIsConnectingLocal] = useState(false);

  // Reset tab saat item berubah
  useEffect(() => {
    if (item) setActiveTab("attributes");
  }, [item]);

  // Lock scroll body saat modal terbuka
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => { document.body.style.overflow = "auto"; };
  }, [open]);

  if (!open || !item) return null;

  const displayItem = detail || item;
  const displayName = displayItem.name || `#${displayItem.identifier}`;
  const imageUrl = displayItem.image_url || displayItem.display_image_url;
  const traits = displayItem.traits || displayItem.attributes || [];
  const finalContractAddress = displayItem.contract || COLLECTION_CONTRACT;

  // Logic Dummy Price (Ambil dari data asli jika ada, kalau tidak pakai placeholder)
  // Di real app, Anda ambil dari item.listings[0].price
  const displayPrice = "0.25 ETH";

  const handleSelectWallet = async (walletId: WalletId) => {
    // 1. Cegah klik jika sedang loading
    if (isConnectingLocal) return;

    setIsConnectingLocal(true);

    try {
      await connect(walletId);
    } catch (err) {
      console.error(err);
    } finally {
      // 2. Buka kunci setelah selesai/gagal (delay sedikit utk UX)
      setTimeout(() => {
        setIsConnectingLocal(false);
      }, 500);
    }
  };

  // const handleNewBid = () => {
  //   if (!isConnected) {
  //       connect();
  //   } else {
  //       alert("Bid functionality coming soon! (API Integration needed)");
  //       setActiveTab("bids");
  //   }
  // };


  // Logic Warna Badge Activity sesuai Gambar Referensi 2
  const getBadgeStyle = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type === 'sale') return 'bg-[#4bd16f] text-black border-black'; // Green
    if (type === 'mint') return 'bg-[#ff6b81] text-black border-black'; // Pink/Red
    if (type === 'bid' || type === 'offer_entered') return 'bg-[#4b91f1] text-black border-black'; // Blue
    if (type === 'cancel' || type === 'cancelled') return 'bg-[#e5e7eb] text-black border-black'; // Grey
    return 'bg-gray-200 text-gray-600 border-gray-400'; // Default
  };

  const getBadgeLabel = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type === 'offer_entered') return 'BID';
    if (type === 'cancelled') return 'CANCEL BID';
    return type.toUpperCase();
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      {/* CARD MODAL */}
      <div
        className="
          flex w-full max-w-2xl flex-col
          min-h-[70vh] sm:min-h-[300px] md:min-h-[350px]
          max-h-[70vh] md:max-h-[500px]
          rounded-[24px] border-2 border-black bg-white
          p-4 sm:p-6 shadow-cartoon
        "
      >
        {/* HEADER TOP */}
        <div className="mb-6 flex flex-none items-start gap-6">
          {/* ==== AVATAR ==== */}
          <div className="
              flex-none
              h-36 w-36 sm:h-40 sm:w-40
              rounded-[22px] border-[4px] border-black
              overflow-hidden bg-white
              shadow-[2px_2px_0px_#000000]
            "
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10">
                <span className="px-1 text-xs font-semibold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)]">
                  {displayItem.collection || "Collection"}
                </span>
              </div>
            )}
          </div>

          {/* ==== RIGHT CONTENT ==== */}
          <div className="flex-1 min-w-0">
            {/* TITLE + CLOSE BUTTON */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <h2 className="text-[24px] sm:text-[40px] font-black leading-tight tracking-tight">
                {displayName}
              </h2>

              <button
                onClick={onClose}
                className="
                  flex h-9 w-9 shrink-0 items-center justify-center
                  rounded-lg border-[3px] border-black bg-[#ff6b81]
                  text-lg font-black shadow-[2px_2px_0px_#000000]
                "
              >
                ✕
              </button>
            </div>

            {/* ==== DESCRIPTION scrollable (exact like screenshot) ==== */}
            <div
              className="
                text-[13px]  text-gray-700
                max-h-[55px] md:max-h-[60px]
                overflow-y-auto pr-3 mb-4
                custom-scrollbar
              "
            >
              {displayItem.description ||
                "We’re building a universe that can grow into stories, digital experiences, community moments, and anything creative we want to explore. make a world feel alive, expressive, and shaped together with the people who love it."}
            </div>

            {/* ==== PRICE ==== */}
            <p className="text-lg mb-3">
              <span className="font-bold text-[#636363]">Price:</span>{" "}
              <span className="font-black text-xl">{displayPrice}</span>
            </p>

            {/* ==== ACTION BUTTONS (PERFECT HORIZONTAL LIKE EXAMPLE) ==== */}
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
              <button
                className="
                  w-full sm:flex-1
                  rounded-[20px] border-2 border-black bg-white
                  px-6 py-2 text-[11px] font-bold uppercase tracking-wide
                  shadow-[2px_2px_0px_#000000]
                  active:translate-x-1 active:translate-y-1 active:shadow-none
                "
              >
                NEW BID
              </button>

              <a
                href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="
                  w-full sm:flex-1
                  flex items-center justify-center
                  rounded-[20px] border-2 border-black bg-brand-yellow
                  px-6 py-2 text-[11px] font-bold uppercase tracking-wide
                  shadow-[2px_2px_0px_#000000]
                  active:translate-x-1 active:translate-y-1 active:shadow-none
                "
              >
                BUY NOW
              </a>
            </div>

          </div>


        </div>

        {/* LOWER CARD: Tabs + Content (SCROLLABLE AREA) */}
        <div
          className="
            flex-1 overflow-y-auto rounded-[24px] border-2 border-black shadow-cartoonTwo
            bg-white p-3 sm:p-4
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
          {/* Tabs */}
          <div className="mb-4 flex gap-4 text-[11px] sm:text-xs">
            {DETAIL_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "border-b-2 pb-1 transition-colors",
                    isActive
                      ? "border-black font-semibold"
                      : "border-transparent text-gray-500 hover:text-black",
                  ].join(" ")}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content area */}

            {/* SUDAH CONNECT → konten tab beneran*/}
            <div className="min-h-[160px] rounded-[18px] border-2 shadow-cartoonTwo border-black bg-white px-3 py-2 sm:px-4 sm:py-3">
              {activeTab === "attributes" && (
                <>
                {(traits?.length ?? 0) === 0 ? (
                  <div className="flex h-full items-center justify-center p-10 text-sm font-bold text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">
                    No attributes found.
                  </div>
                ) : (
                <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
                  {traits.map((trait: any, idx: number) => (
                    <div
                      key={idx}
                      className="rounded-[14px] border-2 border-black bg-white px-3 py-1 shadow-cartoonTwo"
                    >
                      <div className="text-[8px] uppercase text-gray-500 sm:text-[9px]">
                        {trait.trait_type}
                      </div>
                      <div className="text-[10px] font-semibold sm:text-[11px]">
                        {trait.value}
                      </div>

                      {trait.rarity_score && (
                        <div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                                className="bg-black h-full rounded-full"
                                style={{width: `${Math.min(trait.rarity_score, 100)}%`}}
                            />
                        </div>
                      )}

                    </div>
                  ))}
                </div>
                 )}
                </>
              )}

              {activeTab === "activity" && (
                <div className="overflow-x-auto text-[10px] sm:text-[11px]">
                  {!history || history.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-10 text-sm font-bold text-gray-400">
                      No recent activity.
                    </div>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-black/40 text-left">
                          <th className="py-2 pr-4">Type</th>
                          <th className="py-2 pr-4">Seller</th>
                          <th className="py-2 pr-4">Buyer</th>
                          <th className="py-2 pr-4">Value</th>
                          <th className="py-2">Time</th>
                        </tr>
                      </thead>

                      <tbody>
                        {history.slice(0, 15).map((event: any, idx: number) => {
                          const fromAddr = event.from_address || event.maker || event.offerer;
                          const toAddr = event.to_address || event.taker;

                          let priceDisplay = "—";
                          if (event.payment) {
                            const val =
                              parseInt(event.payment.quantity) /
                              Math.pow(10, event.payment.decimals);
                            priceDisplay = val < 0.0001  ? "< 0.001" : val.toFixed(4);
                          } else if (event.price) {
                            priceDisplay = (event.price / 1e18).toFixed(4);
                          }

                          return (
                            <tr key={idx} className="border-b border-black/10">
                              <td className="py-2 pr-4">
                                <span
                                  className="
                                    inline-flex items-center rounded-full
                                    border-2 border-black px-2 py-[2px]
                                    text-[8px] font-semibold sm:text-[9px]
                                  "
                                >
                                  {getBadgeLabel(event.event_type)}
                                </span>
                              </td>

                              <td className="py-2 pr-4">{shortenAddress(fromAddr)}</td>
                              <td className="py-2 pr-4">{shortenAddress(toAddr)}</td>
                              <td className="py-2 pr-4">{priceDisplay}</td>

                              <td className="py-2">
                                {event.event_timestamp
                                  ? new Date(event.event_timestamp * 1000).toLocaleDateString(
                                      "en-US",
                                      { month: "numeric", day: "numeric" }
                                    )
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            {/* gw benerin bagian logic ini biar cuman tab bids yang harus login sisanya engga */}
           {activeTab === "bids" && (
              <>
                {/* 1. Jika sedang Auto-Connect (Refresh halaman) -> Tampilkan Loading */}
                {isConnecting ? (
                    <div className="flex flex-col h-full items-center justify-center min-h-[150px]">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent mb-2"></div>
                        <p className="text-[10px] font-bold text-gray-500">Checking wallet session...</p>
                    </div>
                ) : !isConnected ? (
                  // 2. Jika Selesai Loading & Belum Connect -> Tampilkan Opsi Wallet
                  <div className="flex flex-col h-full justify-center">
                    <p className="mb-4 text-center text-[10px] font-bold text-gray-500 sm:text-xs">
                      Connect wallet to view or place bids
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {WALLET_OPTIONS.map((option) => (
                        <button
                          key={option.label}
                          disabled={isConnectingLocal}
                          onClick={() => handleSelectWallet(option.id)}
                          className={`rounded-xl border-2 border-black bg-white px-3 py-3 text-left text-xs font-semibold shadow-cartoonTwo transition-all ${isConnectingLocal ? "opacity-50" : "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"}`}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center text-[8px] font-bold text-gray-400">IMG</div>
                            <div>{isConnectingLocal ? "..." : option.label}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // 3. Jika Sudah Connect -> Tampilkan Konten Bids
                  <div className="flex flex-col h-full items-center justify-center">
                    <div className="text-[11px] text-gray-600 mb-3">
                      No bids yet. Place the first bid!
                    </div>
                    <a href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${displayItem.contract}/${displayItem.identifier}`} className="px-6 py-2 rounded-full border-2 border-black bg-black text-white text-xs font-bold hover:bg-gray-800">
                      Place a Bid
                    </a>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

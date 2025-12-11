// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletId } from "thirdweb/wallets";


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
  { label: "MetaMask", id: "io.metamask" },
  { label: "WalletConnect", id: "walletConnect" },
  { label: "Coinbase Wallet", id: "com.coinbase.wallet" },
  { label: "Phantom", id: "app.phantom" },
  { label: "OKX Wallet", id: "com.okex.wallet" },
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
  const { isConnected, connect } = useWallet();
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
          min-h-[90vh] max-h-[90vh]
          rounded-[24px] border-2 border-black bg-white
          p-4 sm:p-6 shadow-cartoon
        "
      >
        {/* HEADER TOP */}
        <div className="mb-6 flex flex-none gap-4 sm:gap-6">
          {/* Avatar (image, bukan lagi background) */}
          <div
            className="
              flex h-28 w-28 items-center justify-center
              rounded-[24px] border-2 border-black shadow-cartoon
              sm:h-32 sm:w-32
              overflow-hidden
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
                <span className="px-1 text-[10px] font-semibold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)] sm:text-xs">
                  {displayItem.collection || "Collection Name"}
                </span>
              </div>
            )}
          </div>

          {/* Title + description + price + actions */}
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 className="text-xl font-black leading-tight sm:text-2xl">
                {/* {displayItem.collection || "Collection Name"} */}
                {displayName}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#ff6b81] text-sm font-black shadow-cartoonTwo"
              >
                ✕
              </button>
            </div>

            <p className="mb-3 text-[10px] leading-snug text-gray-700 sm:text-[11px]">
              {displayItem.description || "We’re building a universe that can grow into stories, digital experiences, community moments, and anything creative we want to explore."}
            </p>

            <p className="text-xl">
              <span className="font-bold text-[#636363]">Price:</span>{" "}
              <span className="font-black">{displayPrice}</span>
            </p>

            {/* Action buttons */}
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                className="
                  flex-1 rounded-[20px] border-2 border-black bg-white
                  px-4 py-2 text-[10px] font-bold uppercase tracking-wide
                  shadow-cartoonTwo transition-transform
                  hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                  sm:text-xs
                "
              >
                New Bid
              </button>
              <a
                href={`https://opensea.io/assets/${displayItem.chain || 'ethereum'}/${displayItem.contract}/${displayItem.identifier}`}
                type="button"
                className="
                  flex-1 rounded-[20px] border-2 border-black bg-brand-yellow
                  px-4 py-2 text-[10px] font-bold uppercase tracking-wide
                  shadow-cartoonTwo transition-transform
                  hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#000]
                  sm:text-xs
                "
              >
                Buy Now
              </a>
            </div>
          </div>
        </div>

        {/* LOWER CARD: Tabs + Content (SCROLLABLE AREA) */}
        <div
          className="
            flex-1 overflow-y-auto rounded-[24px] border-2 border-black
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
            <div className="min-h-[160px] rounded-[18px] border-2 border-black bg-white px-3 py-2 sm:px-4 sm:py-3">
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
                      className="rounded-[14px] border-2 border-black bg-white px-3 py-1 shadow-cartoon"
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
                {!isConnected ? (
                  // Jika tab Bids & BELUM Connect -> Tampilkan Opsi Wallet
                  <div className="flex flex-col h-full justify-center">
                    <p className="mb-4 text-center text-[10px] font-bold text-gray-500 sm:text-xs">
                      Connect wallet to view or place bids
                    </p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {WALLET_OPTIONS.map((option) => (
                        <button
                          key={option.label}
                          type="button"
                          disabled={isConnectingLocal}
                          onClick={() => handleSelectWallet(option.id)}
                          className={`
                            rounded-xl border-2 border-black bg-white px-3 py-3 text-left text-xs font-semibold shadow-cartoonTwo transition-all
                            ${
                              isConnectingLocal
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                            }
                          `}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                              <div className="text-[8px] font-bold text-gray-400">
                                IMG
                              </div>
                            </div>
                            <div>
                              {isConnectingLocal ? "Opening..." : option.label}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Jika tab Bids & SUDAH Connect
                  <div className="flex flex-col h-full items-center justify-center">
                    <div className="text-[11px] text-gray-600 mb-3">
                      No bids yet. Place the first bid!
                    </div>
                    <a
                      href={`https://opensea.io/assets/${
                        displayItem.chain || "ethereum"
                      }/${displayItem.contract}/${displayItem.identifier}`}
                      className="px-6 py-2 rounded-full border-2 border-black bg-black text-white text-xs font-bold hover:bg-gray-800"
                    >
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
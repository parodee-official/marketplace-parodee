// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@/context/WalletContext";

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

const WALLET_OPTIONS = [
  "MetaMask",
  "WalletConnect",
  "Coinbase Wallet",
  "Phantom",
  "OKX Wallet",
  "Another Wallet",
];

// Helper untuk menyingkat address (misal: 0x3256)
const shortenAddress = (addr: string) => {
  if (!addr) return "-";
  if (addr.length < 8) return addr;
  return `${addr.substring(0, 4)}...${addr.substring(addr.length - 4)}`;
};

const formatEventPrice = (event: any) => {
  try {
    // Skenario 1: Sale (Biasanya ada di payment)
    if (event.payment && event.payment.quantity) {
      const decimals = event.payment.decimals || 18;
      const symbol = event.payment.symbol || "ETH";
      const val = parseFloat(event.payment.quantity) / Math.pow(10, decimals);
      return { value: val, label: `${val.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol}` };
    }

    // Skenario 2: Listing / Offer (Biasanya ada di start_price atau price)
    // OpenSea API v2 sering menaruh harga listing di 'start_price' (dalam Wei)
    const priceRaw = event.start_price || event.price;
    if (priceRaw) {
      // Asumsi default ETH/Native jika tidak ada info decimals spesifik di event listing
      const val = parseFloat(priceRaw) / 1e18;
      return { value: val, label: `${val.toLocaleString("en-US", { maximumFractionDigits: 4 })} ETH` };
    }
  } catch (e) {
    console.error("Error formatting price:", e);
  }
  return { value: 0, label: "—" };
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

  const processedHistory = useMemo(() => {
    if (!history || !Array.isArray(history)) return [];

    return history.map((event) => {
      const priceData = formatEventPrice(event);
      return {
        ...event,
        formattedPrice: priceData.label,
        rawPriceValue: priceData.value,
        formattedDate: event.event_timestamp
          ? new Date(event.event_timestamp * 1000).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit"
            })
          : "-",
        // Normalize addresses
        fromAddr: event.from_address || event.maker || event.offerer,
        toAddr: event.to_address || event.taker
      };
    });
  }, [history]);

  // Ambil harga dari event terakhir (Sale atau Listing)
  const dynamicPrice = useMemo(() => {
    if (!processedHistory || processedHistory.length === 0) return "Not Listed";

    // Cari event pertama yang memiliki harga valid (Sale atau Listing)
    const latestPriceEvent = processedHistory.find(
      (e) => (e.event_type === "sale" || e.event_type === "listing") && e.rawPriceValue > 0
    );

    if (latestPriceEvent) {
        return latestPriceEvent.formattedPrice;
    }

    // Fallback ke dummy atau data listing static jika ada
    return "Make Offer";
  }, [processedHistory]);

  if (!open || !item) return null;

  const displayItem = detail || item;
  const displayName = displayItem.name || `#${displayItem.identifier}`;
  const imageUrl = displayItem.image_url || displayItem.display_image_url;
  const traits = displayItem.traits || displayItem.attributes || [];

  // Logic Dummy Price (Ambil dari data asli jika ada, kalau tidak pakai placeholder)
  // Di real app, Anda ambil dari item.listings[0].price
  const displayPrice = "0.25 ETH";

  const handleConnectClick = async () => {
    await connect();
  };

  const handleNewBid = () => {
    if (!isConnected) {
        connect();
    } else {
        alert("Bid functionality coming soon! (API Integration needed)");
        setActiveTab("bids");
    }
  };

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
                onClick={handleNewBid}
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
          {!isConnected ? (
            // BELUM CONNECT WALLET → grid CONNECT WALLET
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {WALLET_OPTIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={handleConnectClick}
                  className="
                    rounded-[16px] border-2 border-black bg-white
                    px-3 py-3 text-[11px] font-semibold
                    shadow-cartoon transition-transform
                    hover:-translate-y-0.5
                    sm:text-xs
                  "
                >
                  CONNECT WALLET
                  <div className="mt-1 text-[9px] font-normal text-gray-500">
                    {label}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            // SUDAH CONNECT → konten tab beneran
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
                  {!processedHistory || processedHistory.length === 0 ? (
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
                        {processedHistory.map((event: any, idx: number) => {
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
                            <tr key={`${event.id}-${idx}`} className="border-b border-black/10">
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
                              {/* <td className="py-2 pr-4">{priceDisplay}</td> */}
                              <td className="py-2 pr-4">{event.formattedPrice}</td>

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



              {activeTab === "bids" && (
                <><div className="flex h-full items-center justify-center text-[11px] text-gray-600">
                    No bids yet. Place the first bid!
                  </div><button
                    onClick={handleNewBid}
                    className="mt-2 px-6 py-2 rounded-full border-2 border-black bg-black text-white font-bold hover:bg-gray-800"
                  >
                      Place a Bid
                    </button></>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

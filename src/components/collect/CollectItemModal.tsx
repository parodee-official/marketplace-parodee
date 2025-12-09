// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import type { Collectible } from "@/types/collectible";
import { useWallet } from "@/context/WalletContext";

type CollectItemModalProps = {
  open: boolean;
  item: Collectible | null;
  onClose: () => void;
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

const FALLBACK_TRAITS = [
  { name: "Background", value: "Blue" },
  { name: "Hat", value: "Yellow" },
  { name: "Eyes", value: "Pixel" },
  { name: "Mouth", value: "Smile" },
];

const FALLBACK_ACTIVITY = [
  { type: "CANCEL BID", color: "#d1d5db" },
  { type: "BID", color: "#60a5fa" },
  { type: "SALE", color: "#4ade80" },
  { type: "MINT", color: "#fb7185" },
  { type: "MINT", color: "#fb7185" },
  { type: "CANCEL BID", color: "#d1d5db" },
  { type: "BID", color: "#60a5fa" },
];

export default function CollectItemModal({
  open,
  item,
  onClose,
}: CollectItemModalProps) {
  const { isConnected, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<DetailTab>("attributes");

  // Reset tab ke Attributes saat item berubah
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (item) setActiveTab("attributes");
  }, [item]);

  if (!open || !item) return null;

  const priceLabel = item.priceEth ? `${item.priceEth} ETH` : "—";

  const handleConnectClick = async () => {
    await connect();
    setActiveTab("activity");
  };

  const traits = item.traits?.length ? item.traits : FALLBACK_TRAITS;

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
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10">
                <span className="px-1 text-[10px] font-semibold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)] sm:text-xs">
                  {item.name}
                </span>
              </div>
            )}
          </div>

          {/* Title + description + price + actions */}
          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 className="text-xl font-black leading-tight sm:text-2xl">
                {item.name}
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
              We’re building a universe that can grow into stories, digital
              experiences, community moments, and anything creative we want to
              explore, make a world full alive, expressive, and shaped together
              with the people who love it.
            </p>

            <p className="text-xl">
              <span className="font-bold text-[#636363]">Price:</span>{" "}
              <span className="font-black">{priceLabel}</span>
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
              <button
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
              </button>
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
                <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
                  {traits.map((trait) => (
                    <div
                      key={`${trait.name}-${trait.value}`}
                      className="rounded-[14px] border-2 border-black bg-white px-3 py-1 shadow-cartoon"
                    >
                      <div className="text-[8px] uppercase text-gray-500 sm:text-[9px]">
                        {trait.name}
                      </div>
                      <div className="text-[10px] font-semibold sm:text-[11px]">
                        {trait.value}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "activity" && (
                <div className="overflow-x-auto text-[10px] sm:text-[11px]">
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
                      {FALLBACK_ACTIVITY.map((row, idx) => (
                        <tr key={idx} className="border-b border-black/10">
                          <td className="py-2 pr-4">
                            <span
                              className="
                                inline-flex items-center rounded-full
                                border-2 border-black px-2 py-[2px]
                                text-[8px] font-semibold sm:text-[9px]
                              "
                              style={{ backgroundColor: row.color }}
                            >
                              {row.type}
                            </span>
                          </td>
                          <td className="py-2 pr-4">0x3256</td>
                          <td className="py-2 pr-4">Vitalik</td>
                          <td className="py-2 pr-4">0.3256</td>
                          <td className="py-2">02/24</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "bids" && (
                <div className="flex h-full items-center justify-center text-[11px] text-gray-600">
                  No bids yet. Place the first bid!
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

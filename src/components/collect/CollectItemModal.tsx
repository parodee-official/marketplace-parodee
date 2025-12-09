// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext";

type CollectItemModalProps = {
  open: boolean;
  item: any | null;
  onClose: () => void;
  floorPriceEth?: number | null; // boleh diabaikan dulu, karena kita skip price
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

export default function CollectItemModal({
  open,
  item,
  onClose,
  floorPriceEth,
}: CollectItemModalProps) {
  const { isConnected, connect } = useWallet();
  const [activeTab, setActiveTab] = useState<DetailTab>("attributes");
  

  useEffect(() => {
    if (item) setActiveTab("attributes");
  }, [item]);

  if (!open || !item) return null;

  const displayName = item.name || `#${item.identifier}`;
  const imageUrl = item.image_url || item.display_image_url;

  // someday: item.priceEth / currentListing.price
  const hasItemPrice = typeof item.priceEth === "number";
  const effectivePrice = hasItemPrice
    ? item.priceEth
    : typeof floorPriceEth === "number"
    ? floorPriceEth
    : null;

  const priceLabel = effectivePrice ? `${effectivePrice} ETH` : "—";

  const handleConnectClick = async () => {
    await connect();
    setActiveTab("activity");
  };

  const traits = Array.isArray(item.traits) ? item.traits : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      <div
        className="
          flex w-full max-w-2xl flex-col
          min-h-[90vh] max-h-[90vh]
          rounded-[24px] border-2 border-black bg-white
          p-4 sm:p-6 shadow-cartoon
        "
      >
        {/* HEADER */}
        <div className="mb-6 flex flex-none gap-4 sm:gap-6">
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
                  {displayName}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="mb-2 flex items-start justify-between gap-4">
              <h2 className="text-xl font-black leading-tight sm:text-2xl">
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
              {item.description ??
                "We’re building a universe that can grow into stories, digital experiences, community moments, and anything creative we want to explore."}
            </p>

            <p className="text-xl">
              <span className="font-bold text-[#636363]">Price:</span>{" "}
              <span className="font-black">{priceLabel}</span>
            </p>

            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                className="
                  flex-1 rounded-xl border-2 border-black bg-white
                  px-4 py-2 text-[10px] font-bold uppercase tracking-wide
                  shadow-cartoonTwo
                  hover:translate-x-1 hover:translate-y-1 hover:shadow-none
                  sm:text-xs
                "
              >
                New Bid
              </button>
              <button
                type="button"
                className="
                  flex-1 rounded-xl border-2 border-black bg-brand-yellow
                  px-4 py-2 text-[10px] font-bold uppercase tracking-wide
                  shadow-cartoonTwo
                  hover:translate-x-1 hover:translate-y-1 hover:shadow-none
                  sm:text-xs
                "
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>

        {/* BODY */}
        <div
          className="
            flex-1 overflow-y-auto rounded-[24px] border-2 border-black
            bg-white p-3 sm:p-4
            [scrollbar-width:none] [-ms-overflow-style:none]
            [&::-webkit-scrollbar]:hidden
          "
        >
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

          {!isConnected ? (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {WALLET_OPTIONS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={handleConnectClick}
                  className="
                    rounded-xl border-2 border-black bg-white
                    px-3 py-3 text-[11px] font-semibold
                    shadow-cartoonTwo
                    hover:translate-x-1 hover:translate-y-1 hover:shadow-none
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
            <div className="min-h-[160px] rounded-[18px] border-2 border-black bg-white px-3 py-2 sm:px-4 sm:py-3">
              {activeTab === "attributes" && (
                <>
                  {traits.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-[11px] text-gray-600">
                      No attributes yet for this NFT.
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
                      {traits.map((trait: any) => {
                        const label =
                          trait.name ?? trait.trait_type ?? "Trait";
                        const value =
                          trait.value ?? trait.trait_value ?? "-";
                        const key = `${label}-${value}`;

                        return (
                          <div
                            key={key}
                            className="rounded-[14px] border-2 border-black bg-white px-3 py-1 shadow-cartoon"
                          >
                            <div className="text-[8px] uppercase text-gray-500 sm:text-[9px]">
                              {label}
                            </div>
                            <div className="text-[10px] font-semibold sm:text-[11px]">
                              {value}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {activeTab === "activity" && (
                <div className="flex h-full items-center justify-center text-[11px] text-gray-600">
                  No activity yet for this NFT.
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

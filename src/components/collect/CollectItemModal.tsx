// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@/context/WalletContext"; 
// 1. Import Modal yang sudah ada agar tidak duplikasi kode
import WalletConnectModal from "../layout/WalletConnectModal"; 

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

// Helper address
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
  const { isConnected } = useWallet(); // Kita tidak butuh 'connect' disini lagi, cukup cek status
  const [activeTab, setActiveTab] = useState<DetailTab>("attributes");

  // 2. State untuk mengontrol visibilitas Modal Wallet (Popup di atas Popup)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  useEffect(() => {
    if (item) setActiveTab("attributes");
  }, [item]);

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
  const displayPrice = "0.25 ETH";

  // Handler Bid
  const handleNewBid = () => {
    if (!isConnected) {
        // Jika belum connect, buka modal wallet alih-alih pindah tab
        setIsWalletModalOpen(true);
    } else {
        alert("Bid functionality coming soon! (API Integration needed)");
    }
  };

  const getBadgeLabel = (eventType: string) => {
    const type = eventType.toLowerCase();
    if (type === 'offer_entered') return 'BID';
    if (type === 'cancelled') return 'CANCEL BID';
    return type.toUpperCase();
  };

  return (
    <>
      {/* 3. RENDER MODAL WALLET DISINI 
         Ini akan muncul di atas CollectItemModal jika isWalletModalOpen = true 
      */}
      <WalletConnectModal 
        open={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)} 
      />

      {/* MODAL UTAMA (ITEM) */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
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
            <div className="flex h-28 w-28 items-center justify-center rounded-[24px] border-2 border-black shadow-cartoon sm:h-32 sm:w-32 overflow-hidden">
              {imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={imageUrl} alt={displayName} className="h-full w-full object-cover [image-rendering:pixelated]" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-black/10">
                  <span className="px-1 text-[10px] font-semibold text-white">{displayItem.collection}</span>
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="mb-2 flex items-start justify-between gap-4">
                <h2 className="text-xl font-black leading-tight sm:text-2xl">{displayName}</h2>
                <button onClick={onClose} className="flex h-8 w-8 items-center justify-center rounded-lg border-2 border-black bg-[#ff6b81] text-sm font-black shadow-cartoonTwo">✕</button>
              </div>
              <p className="mb-3 text-[10px] leading-snug text-gray-700 sm:text-[11px]">{displayItem.description || "Description placeholder..."}</p>
              <p className="text-xl"><span className="font-bold text-[#636363]">Price:</span> <span className="font-black">{displayPrice}</span></p>

              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:gap-3">
                <button onClick={handleNewBid} className="flex-1 rounded-[20px] border-2 border-black bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-wide shadow-cartoonTwo hover:-translate-y-0.5 sm:text-xs">
                  New Bid
                </button>
                <a href="#" className="flex-1 rounded-[20px] border-2 border-black bg-brand-yellow px-4 py-2 text-[10px] font-bold uppercase tracking-wide shadow-cartoonTwo hover:-translate-y-0.5 sm:text-xs text-center">
                  Buy Now
                </a>
              </div>
            </div>
          </div>

          {/* LOWER CARD (TABS AREA) */}
          <div className="flex-1 overflow-y-auto rounded-[24px] border-2 border-black bg-white p-3 sm:p-4 [scrollbar-width:none]">
            <div className="mb-4 flex gap-4 text-[11px] sm:text-xs">
              {DETAIL_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`border-b-2 pb-1 transition-colors ${activeTab === tab.id ? "border-black font-semibold" : "border-transparent text-gray-500 hover:text-black"}`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="min-h-[160px] rounded-[18px] border-2 border-black bg-white px-3 py-2 sm:px-4 sm:py-3">
                
                {activeTab === "attributes" && (
                  traits.length === 0 ? <div className="text-center p-4 text-gray-400">No attributes</div> :
                  <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
                    {traits.map((trait: any, idx: number) => (
                      <div key={idx} className="rounded-[14px] border-2 border-black bg-white px-3 py-1 shadow-cartoon">
                        <div className="text-[8px] uppercase text-gray-500">{trait.trait_type}</div>
                        <div className="text-[10px] font-semibold">{trait.value}</div>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === "activity" && (
                   <div className="overflow-x-auto text-[10px] sm:text-[11px]">
                      {(!history || history.length === 0) ? (
                        <div className="p-4 text-center text-gray-400">No recent activity</div>
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
                                  const val = parseInt(event.payment.quantity) / Math.pow(10, event.payment.decimals);
                                  priceDisplay = val < 0.0001  ? "< 0.001" : val.toFixed(4);
                               } else if (event.price) {
                                  priceDisplay = (event.price / 1e18).toFixed(4);
                               }

                               return (
                                 <tr key={idx} className="border-b border-black/10">
                                   <td className="py-2 pr-4">
                                     <span className="inline-flex items-center rounded-full border-2 border-black px-2 py-[2px] text-[8px] font-semibold sm:text-[9px]">
                                       {getBadgeLabel(event.event_type)}
                                     </span>
                                   </td>
                                   <td className="py-2 pr-4">{shortenAddress(fromAddr)}</td>
                                   <td className="py-2 pr-4">{shortenAddress(toAddr)}</td>
                                   <td className="py-2 pr-4">{priceDisplay}</td>
                                   <td className="py-2">
                                     {event.event_timestamp ? new Date(event.event_timestamp * 1000).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }) : "-"}
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
                  <div className="flex h-full w-full flex-col items-center justify-center pt-8 pb-4">
                    
                    {!isConnected ? (
                      // 4. TAMPILAN JIKA BELUM CONNECT (Gunakan Button untuk buka Modal)
                      <>
                        <div className="mb-3 text-[11px] text-gray-500 text-center">
                          You need to connect your wallet to place a bid.
                        </div>
                        <button
                          // Saat diklik, buka Modal Wallet
                          onClick={() => setIsWalletModalOpen(true)}
                          className="
                            rounded-[16px] border-2 border-black bg-black text-white
                            px-6 py-3 text-[11px] font-bold uppercase tracking-wide
                            shadow-cartoon transition-transform hover:-translate-y-0.5
                          "
                        >
                          Connect Wallet
                        </button>
                      </>
                    ) : (
                      // TAMPILAN JIKA SUDAH CONNECT
                      <>
                        <div className="text-[11px] text-gray-600">No bids yet. Place the first bid!</div>
                        <button onClick={handleNewBid} className="mt-4 px-6 py-2 rounded-full border-2 border-black bg-black text-white font-bold hover:bg-gray-800">
                          Place a Bid
                        </button>
                      </>
                    )}

                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
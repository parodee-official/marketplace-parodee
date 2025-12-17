// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletId } from "thirdweb/wallets";
import { getNFTOffersAction } from "@/app/actions/nftActions";

// [FIX 1] HAPUS CONSTANT COLLECTION_CONTRACT YANG HARDCODE INI
// const COLLECTION_CONTRACT = "0x..."; <--- Hapus ini

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

type WalletOption = {
  label: string;
  id: WalletId;
  icon: string;
  hint?: string;
};

const WALLET_OPTIONS: WalletOption[] = [
  { label: "MetaMask", id: "io.metamask", icon: "/icon/metamask.png", hint: "Injected" },
  { label: "Phantom", id: "app.phantom", icon: "/icon/phantom.jpg", hint: "Injected" },
  { label: "WalletConnect", id: "walletConnect", icon: "/icon/walletconnect.png", hint: "Scan QR" },
  { label: "Coinbase Wallet", id: "walletConnect", icon: "/icon/coinbase.svg", hint: "WalletConnect" },
  { label: "OKX Wallet", id: "walletConnect", icon: "/icon/okx.svg", hint: "WalletConnect" },
  { label: "Others", id: "walletConnect", icon: "/icon/wallet-generic.svg", hint: "WalletConnect" },
];

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
  const [bids, setBids] = useState<any[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);

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

  // --- DEFINISI DATA UTAMA ---
  // Prioritaskan 'detail' karena dari CollectPageClient kita menyuntikkan contract address ke situ
  const displayItem = detail || item;

  // Safe Access
  const safeItem = displayItem || {};
  const displayName = safeItem.name || `#${safeItem.identifier}`;
  const imageUrl = safeItem.image_url || safeItem.display_image_url;
  const traits = safeItem.traits || safeItem.attributes || [];

  // [FIX 2] AMBIL CONTRACT LANGSUNG DARI ITEM
  // Jika undefined, biarkan undefined/string kosong, JANGAN fallback ke hardcode Pixel Chaos
  const finalContractAddress = safeItem.contract || "";

  // --- FETCH BIDS ---
  useEffect(() => {
    // [FIX 3] Pastikan finalContractAddress ada sebelum fetch
    if (activeTab === "bids" && open && displayItem && finalContractAddress) {
        const fetchBids = async () => {
            setLoadingBids(true);
            try {
                const data = await getNFTOffersAction(
                    displayItem.chain || "ethereum",
                    finalContractAddress,
                    displayItem.identifier
                );
                if (data && data.orders) {
                    setBids(data.orders);
                }
            } catch (error) {
                console.error("Gagal load bids", error);
            } finally {
                setLoadingBids(false);
            }
        };
        fetchBids();
    }
  }, [activeTab, open, displayItem, finalContractAddress]);

  // --- LOGIC HARGA DINAMIS ---
  const displayPrice = useMemo(() => {
    if (!history || history.length === 0) return "Not Listed";

    const latestPriceEvent = history.find((e: any) => {
      const hasPayment = e.payment && e.payment.quantity;
      const hasPrice = e.price && e.price !== "0";
      const hasStartPrice = e.start_price && e.start_price !== "0";
      return hasPayment || hasPrice || hasStartPrice;
    });

    if (!latestPriceEvent) return "Not Listed";

    let finalPrice = 0;
    let symbol = "ETH";

    try {
      if (latestPriceEvent.payment) {
        const qty = parseFloat(latestPriceEvent.payment.quantity);
        const decimals = latestPriceEvent.payment.decimals || 18;
        symbol = latestPriceEvent.payment.symbol || "ETH";
        finalPrice = qty / Math.pow(10, decimals);
      }
      else if (latestPriceEvent.price) {
        finalPrice = parseFloat(latestPriceEvent.price) / 1e18;
      }
      else if (latestPriceEvent.start_price) {
        finalPrice = parseFloat(latestPriceEvent.start_price) / 1e18;
      }
    } catch (err) {
      console.error("Error parsing price", err);
      return "—";
    }

    if (finalPrice === 0) return "—";
    if (symbol === "WETH") {
        symbol = "ETH";
    }

    return `${finalPrice.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol}`;
  }, [history]);

  if (!open || !item) return null;

  const handleSelectWallet = async (walletId: WalletId) => {
    if (isConnectingLocal) return;
    setIsConnectingLocal(true);
    try {
      await connect(walletId);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsConnectingLocal(false);
      }, 500);
    }
  };

  const getBadgeStyle = (eventType: string) => {
    const type = (eventType || "").toLowerCase();
    if (type === 'sale' || type === 'mint' || type === 'item_listed') return 'bg-[#5efc8d]';
    if (type === 'listing' || type === 'list' || type === 'order' || type === 'created') return 'bg-[#ff7676]';
    if (type === 'bid' || type === 'offer_entered') return 'bg-[#5ce1ff]';
    if (type === 'cancel' || type === 'cancelled') return 'bg-[#d1d5db]';
    if (type === 'transfer') return 'bg-[#c084fc]';
    return 'bg-gray-200';
  };

  const getBadgeLabel = (eventType: string) => {
    const type = (eventType || "").toLowerCase();
    if (type === 'offer_entered') return 'BID';
    if (type === 'cancelled' || type === 'cancel') return 'CANCEL';
    if (type === 'listing' || type === 'list' || type === 'order' || type === 'created') return 'LIST';
    if (type === 'mint') return 'MINT';
    return type.toUpperCase();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      {/* CARD MODAL */}
      <div className="flex w-full max-w-2xl flex-col min-h-[70vh] sm:min-h-[300px] md:min-h-[350px] max-h-[70vh] md:max-h-[500px] rounded-[24px] border-[3px] border-black bg-white p-4 sm:p-6 shadow-cartoon">

         {/* ===== HEADER Desktop ===== */}
        <div className="mb-6 hidden sm:flex flex-none items-start gap-6">
          <div className="flex-none h-36 w-36 sm:h-40 sm:w-40 rounded-[22px] border-[4px] border-black overflow-hidden bg-white shadow-[2px_2px_0px_#000000]">
            {imageUrl ? (
              <img src={imageUrl} alt={displayName} className="h-full w-full object-cover [image-rendering:pixelated]" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <h2 className="text-[40px] font-black leading-tight tracking-tight">{displayName}</h2>
              <button onClick={onClose} className="w-9 h-9 rounded-lg border-[3px] border-black bg-[#FF6467] font-black shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none">✕</button>
            </div>
            <div className="text-xs md:text-[13px] text-gray-700 max-h-[55px] md:max-h-[60px] overflow-y-auto pr-3 mb-4 custom-scrollbar">
              {displayItem.description}
            </div>
            <p className="text-xl mb-3"><span className="font-bold text-[#636363]">Price:</span> <span className="font-black">{displayPrice}</span></p>
            <div className="flex w-full gap-3">
              <a href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center rounded-xl border-2 border-black bg-white px-6 py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">NEW BID</a>
              <a href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center rounded-xl border-2 border-black bg-brand-yellow px-6 py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">BUY NOW</a>
            </div>
          </div>
        </div>

        {/* ===== HEADER MOBILE ONLY ===== */}
        <div className="mb-6 sm:hidden grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square rounded-[22px] border-[4px] border-black overflow-hidden bg-white shadow-[2px_2px_0px_#000000]">
              <img src={imageUrl} alt={displayName} className="h-full w-full object-cover [image-rendering:pixelated]" />
            </div>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex justify-between items-start mb-2 gap-3">
              <h2 className="text-[22px] font-black leading-tight">{displayName}</h2>
              <button onClick={onClose} className="w-7 h-7 rounded-lg border-[3px] border-black bg-[#FF6467] font-black shadow-[2px_2px_0px_#000000] items-end active:translate-x-1 active:translate-y-1 active:shadow-none">✕</button>
            </div>
            <div className="text-xs text-gray-700 max-h-[55px] overflow-y-auto mb-2">{displayItem.description}</div>
            <p className="text-md mb-2"><span className="font-bold text-[#636363]">Price:</span> <span className="font-black">{displayPrice}</span></p>
          </div>
          <a href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center rounded-xl border-2 border-black bg-white py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">NEW BID</a>
          <a href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center rounded-xl border-2 border-black bg-brand-yellow py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">BUY NOW</a>
        </div>

        {/* LOWER CARD: Tabs + Content */}
        <div className="flex-1 overflow-y-auto rounded-[24px] border-[3px] border-black shadow-cartoonTwo bg-white p-3 sm:p-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="mb-4 flex gap-4 text-[11px] sm:text-xs">
            {DETAIL_TABS.map((tab) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`border-b-2 pb-1 transition-colors ${activeTab === tab.id ? "border-black font-semibold" : "border-transparent text-gray-500 hover:text-black"}`}>{tab.label}</button>
            ))}
          </div>

          <div className="min-h-[160px] rounded-[18px] border-[3px] shadow-cartoonTwo border-black bg-white px-3 py-2 sm:px-4 sm:py-3">
              {activeTab === "attributes" && (
                <>
                {(traits?.length ?? 0) === 0 ? (
                  <div className="flex h-full items-center justify-center p-10 text-sm font-bold text-gray-400 border-2 border-dashed border-gray-300 rounded-xl">No attributes found.</div>
                ) : (
                <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px]">
                  {traits.map((trait: any, idx: number) => (
                    <div key={idx} className="rounded-xl border-2 border-black bg-white px-3 py-1 shadow-cartoonTwo active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">
                      <div className="text-[8px] uppercase text-gray-500 sm:text-[9px]">{trait.trait_type}</div>
                      <div className="text-[10px] font-semibold sm:text-[11px]">{trait.value}</div>
                      {trait.rarity_score && (<div className="mt-3 w-full bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className="bg-black h-full rounded-full" style={{width: `${Math.min(trait.rarity_score, 100)}%`}} /></div>)}
                    </div>
                  ))}
                </div>
                 )}
                </>
              )}

              {activeTab === "activity" && (
                <div className="overflow-x-auto text-[10px] sm:text-[11px]">
                  {!history || history.length === 0 ? (
                    <div className="flex h-full items-center justify-center p-10 text-sm font-bold text-gray-400">No recent activity.</div>
                  ) : (
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="border-b border-black/40 text-left">
                          <th className="py-2 pr-4">Type</th><th className="py-2 pr-4">Seller</th><th className="py-2 pr-4">Buyer</th><th className="py-2 pr-4">Value</th><th className="py-2">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.slice(0, 15).map((event: any, idx: number) => {
                          const fromAddr = event.from_address || event.maker || event.offerer;
                          const toAddr = event.to_address || event.taker;
                          let priceDisplay = "—"; let symbol = "ETH";
                          if (event.payment) {
                            const val = parseInt(event.payment.quantity) / Math.pow(10, event.payment.decimals);
                            priceDisplay = val < 0.0001 ? "< 0.001" : val.toFixed(4);
                            if (event.payment.symbol) symbol = event.payment.symbol === "WETH" ? "ETH" : event.payment.symbol;
                          } else if (event.price) { priceDisplay = (event.price / 1e18).toFixed(4);
                          } else if (event.start_price) { priceDisplay = (event.start_price / 1e18).toFixed(4); }
                          if (priceDisplay !== "—") priceDisplay = `${priceDisplay} ${symbol}`;
                          return (
                            <tr key={idx} className="border-b border-black/10">
                              <td className="py-2 pr-4"><span className={`inline-flex items-center justify-center rounded-lg border-2 border-black px-3 py-[5px] text-[9px] font-black tracking-wide text-black ${getBadgeStyle(event.event_type)}`}>{getBadgeLabel(event.event_type)}</span></td>
                              <td className="py-2 pr-4">{shortenAddress(fromAddr)}</td>
                              <td className="py-2 pr-4">{shortenAddress(toAddr)}</td>
                              <td className="py-2 pr-4">{priceDisplay}</td>
                              <td className="py-2">{event.event_timestamp ? new Date(event.event_timestamp * 1000).toLocaleDateString("en-US", { month: "numeric", day: "numeric" }) : "-"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {activeTab === "bids" && (
                <div className="flex flex-col h-full">
                  <div className="mt-auto border-t border-black/5">
                      {isConnecting ? (
                      <div className="flex flex-col h-full items-center justify-center min-h-[150px]">
                          <div className="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent mb-2"></div>
                          <p className="text-[10px] font-bold text-gray-500">Checking wallet session...</p>
                      </div>
                  ) : !isConnected ? (
                    <div className="flex flex-col h-full justify-center">
                      <p className="mb-4 text-center text-[10px] font-bold text-gray-500 sm:text-xs">Connect wallet to view or place bids</p>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {WALLET_OPTIONS.map((option) => (
                          <button key={option.label} disabled={isConnectingLocal} onClick={() => handleSelectWallet(option.id)} className={`rounded-xl border-2 border-black bg-white px-3 py-3 text-left text-xs font-semibold shadow-cartoonTwo ${isConnectingLocal ? "opacity-50 cursor-not-allowed" : "active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5"}`}>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 flex-none rounded-full border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                                <img src={option.icon} alt={`${option.label} logo`} className="h-4 w-4 object-contain" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; const parent = e.currentTarget.parentElement; if (parent) parent.innerHTML = `<div class='text-[8px] font-bold text-gray-400'>IMG</div>`; }} />
                              </div>
                              <div className="truncate">{isConnectingLocal ? "..." : option.label}</div>
                            </div>
                          </button>
                          ))}
                        </div>
                      </div>
                    )  : (
                    <>
                      <div className="flex-1 overflow-y-auto text-[10px] sm:text-[11px] mb-4 border-b border-gray-100 pb-2 ">
                        {loadingBids ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2"><div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div><span className="text-[10px]">Loading bids...</span></div>
                        ) : bids.length === 0 ? (
                          <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60 p-8"><div className="text-xl mb-1">📉</div><p className="text-[10px] font-bold">No active bids on OpenSea</p></div>
                        ) : (
                          <table className="w-full border-collapse">
                            <thead><tr className="border-b border-black/40 text-left"><th className="py-2 pr-4">Price</th><th className="py-2 pr-4">From</th><th className="p-2 rounded-tr-lg text-right">Expiration</th></tr></thead>
                            <tbody>
                              {bids.map((bid, i) => {
                                const price = (parseInt(bid.current_price) / 1e18).toFixed(4);
                                const maker = shortenAddress(bid.maker.address);
                                const expDate = new Date(bid.expiration_time * 1000).toLocaleDateString();
                                return (
                                  <tr key={i} className="border-b border-black/10"><td className="py-2 pr-4">{price} WETH</td><td className="py-2 pr-4">{maker}</td><td className="p-2 text-right text-gray-400">{expDate}</td></tr>
                                );
                              })}
                            </tbody>
                          </table>
                        )}
                      </div>
                      <a href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`} target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-3 text-white shadow-cartoonTwo hover:bg-gray-900 transition-all hover:-translate-y-0.5">
                        <span className="text-xs font-black uppercase tracking-widest">Place Bid on OpenSea</span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mb-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                      </a>
                    </>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

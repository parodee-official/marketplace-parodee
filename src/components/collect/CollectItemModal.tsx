// src/components/collect/CollectItemModal.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import { useWallet } from "@/context/WalletContext";
import { WalletId } from "thirdweb/wallets";
import { getNFTOffersAction } from "@/app/actions/nftActions";

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

type WalletOption = {
  label: string;
  id: WalletId;
  icon: string; // path under /public/icon
  hint?: string;
};

const WALLET_OPTIONS: WalletOption[] = [
  { label: "MetaMask", id: "io.metamask", icon: "/icon/metamask.png", hint: "Injected" },
  { label: "Phantom", id: "app.phantom", icon: "/icon/phantom.jpg", hint: "Injected" },

  // force WalletConnect flow for these labels (use same id but different icons)
  { label: "WalletConnect", id: "walletConnect", icon: "/icon/walletconnect.png", hint: "Scan QR" },
  { label: "Coinbase Wallet", id: "walletConnect", icon: "/icon/coinbase.svg", hint: "WalletConnect" },
  { label: "OKX Wallet", id: "walletConnect", icon: "/icon/okx.svg", hint: "WalletConnect" },

  // fallback / others
  { label: "Others", id: "walletConnect", icon: "/icon/wallet-generic.svg", hint: "WalletConnect" },
];



// const WALLET_OPTIONS: { label: string; id: WalletId }[] = [
//   // MetaMask biasanya punya Extension, jadi aman pakai ID spesifik
//   { label: "MetaMask", id: "io.metamask" },

//   // WalletConnect (Generic) -> INI PALING STABIL UNTUK QR
//   { label: "WalletConnect", id: "walletConnect" },

//   // --- PERBAIKAN DI SINI ---
//   // Ubah ID OKX & Coinbase menjadi 'walletConnect' jika target utamanya adalah Scan QR.
//   // Ini akan memaksa sistem menyimpan session data.
//   { label: "Coinbase Wallet", id: "walletConnect" },
//   { label: "Phantom", id: "app.phantom" }, // Phantom biasanya deteksi extension dgn baik
//   { label: "OKX Wallet", id: "walletConnect" }, // <--- GANTI INI DARI 'com.okex.wallet' KE 'walletConnect'

//   { label: "Others", id: "walletConnect" },
// ];


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
  // --- STATE BARU UNTUK BIDS ---
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



  // --- LOGIC HARGA DINAMIS (REVISI: FORCE ETH) ---
  const displayPrice = useMemo(() => {
    // 1. Cek history
    if (!history || history.length === 0) return "Not Listed";

    // 2. Cari event terbaru (Sale/Listing/Transfer dengan value)
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
        // Event Sale/Offer biasanya punya symbol di payment
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

    // --- LOGIC GANTI WETH JADI ETH ---
    if (symbol === "WETH") {
        symbol = "ETH";
    }

    return `${finalPrice.toLocaleString("en-US", { maximumFractionDigits: 4 })} ${symbol}`;
  }, [history]);

  if (!open || !item) return null;

  const displayItem = detail || item;
  const displayName = displayItem.name || `#${displayItem.identifier}`;
  const imageUrl = displayItem.image_url || displayItem.display_image_url;
  const traits = displayItem.traits || displayItem.attributes || [];
  const finalContractAddress = displayItem.contract || COLLECTION_CONTRACT;
  
  // Logic Dummy Price (Ambil dari data asli jika ada, kalau tidak pakai placeholder)
  // Di real app, Anda ambil dari item.listings[0].price
  // const displayPrice = "0.25 ETH";


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
  // --- HELPER WARNA BACKGROUND (Updated) ---
  const getBadgeStyle = (eventType: string) => {
    const type = (eventType || "").toLowerCase();

    // 1. SALE & MINT -> HIJAU NEON (Sesuai request)
    if (type === 'sale' || type === 'mint' || type === 'item_listed') {
        return 'bg-[#5efc8d]';
    }

    // 2. LISTING / ORDER -> MERAH SALMON
    // Penting: OpenSea v2 sering mengirim 'order' atau 'created' untuk Listing
    if (type === 'listing' || type === 'list' || type === 'order' || type === 'created') {
        return 'bg-[#ff7676]';
    }

    // 3. BID / OFFER -> BIRU CYAN
    if (type === 'bid' || type === 'offer_entered') {
        return 'bg-[#5ce1ff]';
    }

    // 4. CANCEL -> ABU-ABU
    if (type === 'cancel' || type === 'cancelled') {
        return 'bg-[#d1d5db]';
    }

    // 5. TRANSFER -> UNGU (Opsional, untuk membedakan dengan default)
    if (type === 'transfer') {
        return 'bg-[#c084fc]';
    }

    // Default (Abu-abu muda)
    return 'bg-gray-200';
  };

  // --- HELPER LABEL TEKS (Updated) ---
  const getBadgeLabel = (eventType: string) => {
    const type = (eventType || "").toLowerCase();

    if (type === 'offer_entered') return 'BID';
    if (type === 'cancelled' || type === 'cancel') return 'CANCEL';

    // Pastikan 'order' dilabeli sebagai LIST agar user paham
    if (type === 'listing' || type === 'list' || type === 'order' || type === 'created') return 'LIST';

    if (type === 'mint') return 'MINT';

    return type.toUpperCase(); // transfer -> TRANSFER, sale -> SALE
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-3 sm:px-4">
      {/* CARD MODAL */}
      <div
        className="
          flex w-full max-w-2xl flex-col
          min-h-[70vh] sm:min-h-[300px] md:min-h-[350px]
          max-h-[70vh] md:max-h-[500px]
          rounded-[24px] border-[3px] border-black bg-white
          p-4 sm:p-6 shadow-cartoon
        "
      >
         {/* ===== HEADER Desktop ===== */}
        <div className="mb-6 hidden sm:flex flex-none items-start gap-6">
          {/* ==== AVATAR ==== */}
          <div className="flex-none h-36 w-36 sm:h-40 sm:w-40 rounded-[22px] border-[4px] border-black overflow-hidden bg-white shadow-[2px_2px_0px_#000000]">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10" />
            )}
          </div>

          {/* ==== RIGHT CONTENT ==== */}
          <div className="flex-1 min-w-0">
            {/* TITLE + CLOSE */}
            <div className="flex items-start justify-between gap-4 mb-1">
              <h2 className="text-[40px] font-black leading-tight tracking-tight">
                {displayName}
              </h2>
              <button onClick={onClose} className="w-9 h-9 rounded-lg border-[3px] border-black bg-[#FF6467] font-black shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none">
                ✕
              </button>
            </div>

            {/* DESC */}
            <div className="
            text-xs md:text-[13px]  text-gray-700
                max-h-[55px] md:max-h-[60px]
                overflow-y-auto pr-3 mb-4
                custom-scrollbar
            ">
              {displayItem.description}
            </div>

            {/* PRICE */}
            <p className="text-xl mb-3">
              <span className="font-bold text-[#636363]">Price:</span>{" "}
              <span className="font-black">{displayPrice}</span>
            </p>

            {/* ACTIONS DESKTOP */}
            <div className="flex w-full gap-3">
              <button className="flex-1 rounded-xl border-2 border-black bg-white px-6 py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">
                NEW BID
              </button>
              <a
                href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center rounded-xl border-2 border-black bg-brand-yellow px-6 py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">
                BUY NOW
              </a>
            </div>
          </div>
        </div>

        {/* ===== HEADER MOBILE ONLY ===== */}
        <div className="mb-6 sm:hidden grid grid-cols-2 gap-4">
          {/* AVATAR */}
          <div className="flex flex-col items-center">
            <div className="w-full aspect-square rounded-[22px] border-[4px] border-black overflow-hidden bg-white shadow-[2px_2px_0px_#000000]">
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex flex-col min-w-0">
          {/* <div className="flex justify-end mb-4">
            <button onClick={onClose} className="w-7 h-7 rounded-lg border-[3px] border-black bg-[#FF6467] font-black items-end active:translate-x-1 active:translate-y-1 active:shadow-none">
                ✕
            </button>
          </div> */}

            <div className="flex justify-between items-start mb-2 gap-3">
              <h2 className="text-[22px] font-black leading-tight">
                {displayName}
              </h2>
              <button onClick={onClose} className="w-7 h-7 rounded-lg border-[3px] border-black bg-[#FF6467] font-black items-end active:translate-x-1 active:translate-y-1 active:shadow-none">
                ✕
            </button>

            </div>

            <div className="text-xs text-gray-700 max-h-[55px] overflow-y-auto mb-2">
              {displayItem.description}
            </div>

            <p className="text-md mb-2">
              <span className="font-bold text-[#636363]">Price:</span>{" "}
              <span className="font-black">{displayPrice}</span>
            </p>
          </div>

          {/* ACTION ROW — SEJAJAR FIX */}
          <button className="w-full rounded-xl border-2 border-black bg-white py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">
            NEW BID
          </button>

          <a
            href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center rounded-xl border-2 border-black bg-brand-yellow py-2 text-[11px] font-black uppercase shadow-[2px_2px_0px_#000000] active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5">
            BUY NOW
          </a>
        </div>

        {/* LOWER CARD: Tabs + Content (SCROLLABLE AREA) */}
        <div
          className="
            flex-1 overflow-y-auto rounded-[24px] border-[3px] border-black shadow-cartoonTwo
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
          <div className="min-h-[160px] rounded-[18px] border-[3px] shadow-cartoonTwo border-black bg-white px-3 py-2 sm:px-4 sm:py-3">
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
                      className="rounded-xl border-2 border-black bg-white px-3 py-1 shadow-cartoonTwo active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5"
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
                          let symbol = "ETH"; // Default symbol

                          if (event.payment) {
                            // CASE 1: Sale/Offer (Punya data payment lengkap)
                            const val =
                              parseInt(event.payment.quantity) /
                              Math.pow(10, event.payment.decimals);
                            priceDisplay = val < 0.0001 ? "< 0.001" : val.toFixed(4);

                            // Ambil symbol asli, jika WETH paksa jadi ETH
                            if (event.payment.symbol) {
                                symbol = event.payment.symbol === "WETH" ? "ETH" : event.payment.symbol;
                            }
                          } else if (event.price) {
                            // CASE 2: Listing (Biasanya Wei)
                            priceDisplay = (event.price / 1e18).toFixed(4);
                          } else if (event.start_price) {
                             // CASE 3: Listing tipe lain
                             priceDisplay = (event.start_price / 1e18).toFixed(4);
                          }

                          // GABUNGKAN ANGKA + SYMBOL (Misal: "0.5000 ETH")
                          if (priceDisplay !== "—") {
                              priceDisplay = `${priceDisplay} ${symbol}`;
                          }

                          return (
                            <tr key={idx} className="border-b border-black/10">
                              <td className="py-2 pr-4">
                                <span
                                  className={`
                                    inline-flex items-center justify-center rounded-lg
                                    border-2 border-black px-3 py-[5px]
                                    text-[9px] font-black tracking-wide text-black
                                    ${getBadgeStyle(event.event_type)}
                                  `}
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
             {/* --- TAB: BIDS (YANG KITA RUBAH) --- */}
              {activeTab === "bids" && (
                  <div className="flex flex-col h-full">
                    
                    {/* 1. LIST DAFTAR BID (PUBLIC VIEW) */}
                    {/* Ini ditampilkan ke SEMUA user (connect/not connect) */}
                    <div className="flex-1 overflow-y-auto mb-4 border-b border-gray-100 pb-2 min-h-[100px]">
                        {loadingBids ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"></div>
                                <span className="text-[10px]">Loading bids...</span>
                             </div>
                        ) : bids.length === 0 ? (
                             <div className="flex flex-col items-center justify-center h-full text-gray-400 opacity-60">
                                <div className="text-xl mb-1">📉</div>
                                <p className="text-[10px] font-bold">No active bids on OpenSea</p>
                             </div>
                        ) : (
                             <table className="w-full text-left text-[10px]">
                                <thead className="bg-gray-100 text-gray-500 sticky top-0">
                                    <tr>
                                        <th className="p-2 rounded-tl-lg">Price</th>
                                        <th className="p-2">From</th>
                                        <th className="p-2 rounded-tr-lg text-right">Expiration</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {bids.map((bid, i) => {
                                        // Format Harga (Wei -> ETH)
                                        const price = (parseInt(bid.current_price) / 1e18).toFixed(4);
                                        const maker = shortenAddress(bid.maker.address);
                                        const expDate = new Date(bid.expiration_time * 1000).toLocaleDateString();
                                        
                                        return (
                                            <tr key={i}>
                                                <td className="p-2 font-bold">{price} WETH</td>
                                                <td className="p-2 text-gray-500">{maker}</td>
                                                <td className="p-2 text-right text-gray-400">{expDate}</td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                             </table>
                        )}
                    </div>

                    {/* 2. AREA AKSI (CONNECT / PLACE BID) */}
                    <div className="mt-auto pt-2 border-t border-black/5">
                        {isConnecting ? (
                            <div className="flex justify-center py-2">
                                <span className="text-[10px] font-bold text-gray-500 animate-pulse">Connecting wallet...</span>
                            </div>
                        ) : !isConnected ? (
                            // JIKA BELUM CONNECT: Tampilkan Tombol Connect
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-[10px] text-gray-400 font-medium">Connect wallet to place a bid</p>
                                <div className="flex gap-2 w-full">
                                    {WALLET_OPTIONS.slice(0, 2).map((opt) => (
                                        <button 
                                            key={opt.label}
                                            onClick={() => handleSelectWallet(opt.id)}
                                            disabled={isConnectingLocal}
                                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border-2 border-gray-200 hover:border-black transition-colors text-[10px] font-bold"
                                        >
                                            <img src={opt.icon} className="h-3 w-3" alt="" />
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            // JIKA SUDAH CONNECT: Tombol Redirect ke OpenSea
                            <a 
                              href={`https://opensea.io/assets/${displayItem.chain || "ethereum"}/${finalContractAddress}/${displayItem.identifier}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-4 py-3 text-white shadow-cartoonTwo hover:bg-gray-900 transition-all hover:-translate-y-0.5"
                            >
                              <span className="text-xs font-black uppercase tracking-widest">
                                Place Bid on OpenSea
                              </span>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="mb-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                            </a>
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
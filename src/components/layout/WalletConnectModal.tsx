// src/components/layout/WalletConnectModal.tsx
"use client";

import { useWallet } from "@/context/WalletContext"; // Pastikan path benar
import { useEffect, useState } from "react";
import { WalletId } from "thirdweb/wallets";

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

const WALLET_OPTIONS: { label: string; id: WalletId }[] = [
  // Metamask & Phantom biasanya punya Extension di browser, jadi aman pakai ID spesifik
  { label: "MetaMask", id: "io.metamask" },
  { label: "Phantom", id: "app.phantom" },

  // --- UBAH ID DI BAWAH INI MENJADI 'walletConnect' ---
  // Ini triknya: Walaupun labelnya "OKX" atau "Coinbase", 
  // kita paksa sistem menggunakan jalur standar WalletConnect (QR Code)
  // agar Session Data tersimpan di LocalStorage.
  { label: "WalletConnect", id: "walletConnect" },
  { label: "Coinbase Wallet", id: "walletConnect" }, // Ubah id jadi walletConnect
  { label: "OKX Wallet", id: "walletConnect" },      // Ubah id jadi walletConnect
  
  { label: "Others", id: "walletConnect" },
];

export default function WalletConnectModal({
  open,
  onClose,
}: WalletConnectModalProps) {
  const { isConnected, connect } = useWallet();
  
  // State untuk mengunci tombol agar tidak double-click
  const [isConnectingLocal, setIsConnectingLocal] = useState(false);

  // Auto close saat berhasil connect
  useEffect(() => {
    if (isConnected && open) {
      onClose();
    }
  }, [isConnected, open, onClose]);

  if (!open) return null;

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

  return (
    // 3. PENTING: Gunakan z-[60] agar muncul DI ATAS CollectItemModal (yang biasanya z-50)
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      
      <div className="w-full max-w-md rounded-[24px] border-2 border-black bg-white p-5 shadow-cartoon">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Connect Wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            // Pastikan tombol close tidak disabled
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold shadow-cartoon hover:bg-red-100"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-gray-600">
          Choose one of the available Web3 wallets to connect.
        </p>

        {/* Wallet list */}
        <div className="grid grid-cols-2 gap-3">
          {WALLET_OPTIONS.map((option) => (
            <button
              // 4. FIX: Gunakan label sebagai key agar unik
              key={option.label} 
              
              type="button"
              disabled={isConnectingLocal} // Disable tombol saat loading
              onClick={() => handleSelectWallet(option.id)}
              className={`
                rounded-xl border-2 border-black bg-white px-3 py-3 text-left text-xs font-semibold shadow-cartoonTwo transition-all 
                ${isConnectingLocal 
                    ? "opacity-50 cursor-not-allowed" 
                    : "hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none"
                }
              `}
            >
              <div className="mb-1 h-6 w-6 rounded-full border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">
                 {/* Placeholder Icon */}
                 <div className="text-[8px] font-bold text-gray-400">IMG</div>
              </div>
              
              <div>
                {/* Feedback visual teks */}
                {isConnectingLocal ? "Opening..." : option.label}
              </div>

              <div className="mt-1 text-[10px] font-normal text-gray-500">
                {option.id === "walletConnect" ? "Scan QR" : "Injected"}
              </div>
            </button>
          ))}
        </div>

        {isConnected && (
          <p className="mt-3 text-[11px] text-green-600 font-bold text-center">
            ✓ Wallet Connected Successfully
          </p>
        )}
      </div>
    </div>
  );
}
// src/components/layout/WalletConnectModal.tsx
"use client";

import { useWallet } from "@/context/WalletContext";
import { useEffect, useState } from "react";
import type { WalletId } from "thirdweb/wallets";

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

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

export default function WalletConnectModal({
  open,
  onClose,
}: WalletConnectModalProps) {
  const { isConnected, connect } = useWallet();

  const [isConnectingLocal, setIsConnectingLocal] = useState(false);

  useEffect(() => {
    if (isConnected && open) {
      onClose();
    }
  }, [isConnected, open, onClose]);

  if (!open) return null;

  const handleSelectWallet = async (walletId: WalletId) => {
    if (isConnectingLocal) return;
    setIsConnectingLocal(true);

    try {
      await connect(walletId);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setIsConnectingLocal(false), 500);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[24px] border-[3px] border-black bg-white p-5 shadow-[2px_2px_0px_#000000]">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">Connect Wallet</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold shadow-[2px_2px_0px_#000000] hover:bg-red-100"
            aria-label="Close wallet modal"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-gray-600">Choose one of the available Web3 wallets to connect.</p>

        {/* Wallet list */}
        <div className="grid grid-cols-2 gap-5">
          {WALLET_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              disabled={isConnectingLocal}
              onClick={() => handleSelectWallet(option.id)}
              className={`group flex items-start gap-3 rounded-xl border-2 border-black bg-white px-3 py-3 text-left text-xs font-semibold shadow-cartoonTwo md:shadow-cartoon
                ${isConnectingLocal ? "opacity-50 cursor-not-allowed" : "active:translate-x-1 active:translate-y-1 active:shadow-none hover:-translate-x-0.5 hover:-translate-y-0.5"}
              `}
            >
              {/* Icon circle */}
              <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 border-black bg-gray-100 overflow-hidden">
                {/* try to load image from public/icon; if missing, fallback text */}
                {/* Using plain <img> so it's simple and works with svg/png */}
                <img
                  src={option.icon}
                  alt={`${option.label} logo`}
                  onError={(e) => {
                    // fallback to simple text if image not found
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const parent = e.currentTarget.parentElement;
                    if (parent) parent.innerHTML = `<div class="text-[10px] font-bold text-gray-400">IMG</div>`;
                  }}
                  className="h-6 w-6 object-contain"
                />
              </div>

              {/* Label + hint */}
              <div className="flex-1 min-w-0">
                <div className="truncate">{isConnectingLocal ? "Opening..." : option.label}</div>
                <div className="mt-1 text-[10px] font-normal text-gray-500">{option.hint}</div>
              </div>
            </button>
          ))}
        </div>

        {isConnected && (
          <p className="mt-3 text-[11px] text-green-600 font-bold text-center">✓ Wallet Connected Successfully</p>
        )}
      </div>
    </div>
  );
}

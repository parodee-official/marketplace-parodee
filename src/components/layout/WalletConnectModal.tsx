// src/components/layout/WalletConnectModal.tsx
"use client";

import { useWallet } from "@/context/WalletContext";

type WalletConnectModalProps = {
  open: boolean;
  onClose: () => void;
};

const WALLET_OPTIONS = [
  "MetaMask",
  "WalletConnect",
  "Coinbase Wallet",
  "Phantom",
  "OKX Wallet",
  "Another Wallet",
];

export default function WalletConnectModal({
  open,
  onClose,
}: WalletConnectModalProps) {
  const { isConnected, connect } = useWallet();

  if (!open) return null;

  const handleSelectWallet = async () => {
    await connect(); // mock connect – nanti bisa bawa info wallet terpilih kalau perlu
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-md rounded-[24px] border-2 border-black bg-white p-5 shadow-cartoon">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide">
            Connect Wallet
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-black bg-white text-xs font-bold shadow-cartoon"
          >
            ✕
          </button>
        </div>

        <p className="mb-3 text-xs text-gray-600">
          Choose one of the available Web3 wallets to connect. (Mock only)
        </p>

        {/* Wallet list */}
        <div className="grid grid-cols-2 gap-3">
          {WALLET_OPTIONS.map((label) => (
            <button
              key={label}
              type="button"
              onClick={handleSelectWallet}
              className="rounded-xl border-2 border-black bg-white px-3 py-3 text-left text-xs font-semibold shadow-cartoonTwo  hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
            >
              <div className="mb-1 h-6 w-6 rounded-full border-2 border-black bg-gray-100" />
              <div>{label}</div>
              <div className="mt-1 text-[10px] font-normal text-gray-500">
                Placeholder provider
              </div>
            </button>
          ))}
        </div>

        {isConnected && (
          <p className="mt-3 text-[11px] text-green-600">
            Wallet already connected (mock).
          </p>
        )}
      </div>
    </div>
  );
}

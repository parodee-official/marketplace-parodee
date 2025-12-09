// src/components/layout/WalletButton.tsx
"use client";

import { useWallet } from "@/context/WalletContext";

type WalletButtonProps = {
  label: string;
  onClick?: () => void; // custom handler (misal buka modal)
};

export default function WalletButton({ label, onClick }: WalletButtonProps) {
  const { isConnected, connect, disconnect } = useWallet();

  const handleClick = () => {
    if (isConnected) {
      // masih boleh disconnect langsung dari header
      disconnect();
    } else if (onClick) {
      // belum connect & ada custom handler → buka modal
      onClick();
    } else {
      // fallback: connect langsung (kalau dipakai di tempat lain tanpa modal)
      connect();
    }
  };

  const finalLabel = isConnected ? "CONNECTED" : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-xl border-2 border-black bg-brand-yellow px-5 py-1.5 text-xs font-bold uppercase tracking-wide shadow-cartoonTwo transition-transform hover:-translate-y-0.5 active:translate-y-0"
    >
      {finalLabel}
    </button>
  );
}

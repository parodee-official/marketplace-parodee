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
      className="rounded-lg border-[2.5px] border-black bg-brand-yellow px-5 py-1.5 text-xs font-black uppercase tracking-wide shadow-cartoonTwo active:translate-y-1 active:translate-x-1"
    >
      {finalLabel}
    </button>
  );
}

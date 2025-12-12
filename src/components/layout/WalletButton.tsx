// src/components/layout/WalletButton.tsx
"use client";

import { useWallet } from "@/context/WalletContext"; // Pastikan path benar

type WalletButtonProps = {
  label: string;
  onClick?: () => void; // Function dari Parent (Header) untuk membuka Modal Wallet
};
export default function WalletButton({ label, onClick }: WalletButtonProps) {
  // Ambil isConnecting juga
  const { isConnected, connect, disconnect, isConnecting } = useWallet();

  const handleClick = () => {
    if (isConnecting) return; // Cegah klik saat loading
    if (isConnected) {
      disconnect();
    } else if (onClick) {
      onClick();
    } else {
      connect("io.metamask"); // Default fallback
    }
  };

  // Teks tombol berubah saat loading
  let finalLabel = label;
  if (isConnecting) {
    finalLabel = "LOADING...";
  } else if (isConnected) {
    finalLabel = "CONNECTED";
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        rounded-lg border-[2.5px] border-black px-5 py-2 text-xs font-black uppercase tracking-wide shadow-cartoonTwo active:translate-y-1 active:translate-x-1
        ${isConnecting ? "bg-gray-300 cursor-wait" : "bg-brand-yellow"}
      `}
    >
      {finalLabel}
    </button>
  );
}

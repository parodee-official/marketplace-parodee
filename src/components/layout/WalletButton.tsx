// src/components/layout/WalletButton.tsx
"use client";

import { useWallet } from "@/context/WalletContext"; // Pastikan path benar

type WalletButtonProps = {
  label: string;
  onClick?: () => void; // Function dari Parent (Header) untuk membuka Modal Wallet
};

export default function WalletButton({ label, onClick }: WalletButtonProps) {
  // 1. Ambil 'address' dari context untuk ditampilkan
  const { isConnected, address, disconnect } = useWallet();

  const handleClick = () => {
    if (isConnected) {
      // Tambahkan konfirmasi sederhana agar user tidak kaget logout
      if (confirm("Disconnect wallet?")) {
        disconnect();
      }
    } else {
      // Jika belum connect, panggil fungsi onClick (untuk Buka Modal)
      // Kita HAPUS fallback connect() karena sekarang connect butuh ID wallet
      if (onClick) {
        onClick();
      }
    }
  };

  // 2. Helper untuk menyingkat address (Contoh: 0x1234...5678)
  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // 3. Logic Label: Tampilkan Address jika connect, Label asli jika belum
  const finalLabel = isConnected && address ? shortenAddress(address) : label;

  return (
    <button
      type="button"
      onClick={handleClick}
      className="
        rounded-lg border-[2.5px] border-black bg-brand-yellow 
        px-5 py-1.5 text-xs font-black uppercase tracking-wide 
        shadow-cartoonTwo active:translate-y-1 active:translate-x-1
        // Tambahan style agar teks tidak kepanjangan
        truncate max-w-[140px]
      "
    >
      {finalLabel}
    </button>
  );
}
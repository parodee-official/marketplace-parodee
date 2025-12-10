// src/components/ThirdwebWrapper.tsx
"use client";

import { ThirdwebProvider, AutoConnect } from "thirdweb/react";
import { createWallet } from "thirdweb/wallets";
import { client } from "@/lib/client";

// Konfigurasi wallet dipindah ke sini (Sisi Client)
const wallets = [
  createWallet("io.metamask"),
  createWallet("walletConnect"),
  createWallet("com.coinbase.wallet"),
  createWallet("app.phantom"),
  createWallet("com.okex.wallet"),
];

export default function ThirdwebWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThirdwebProvider>
      <AutoConnect client={client} wallets={wallets} />
      {children}
    </ThirdwebProvider>
  );
}
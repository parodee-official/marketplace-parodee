// hooks/useWallet.ts
"use client";

import { useState } from "react";

export function useWallet() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  const connect = async () => {
    // MOCK / DUMMY CONNECT
    // Kalau mau connect beneran ke MetaMask nanti gue buat versi lengkapnya
    setIsConnected(true);
    setAddress("0xFAKE1234567890WalletAddress");
  };

  const disconnect = () => {
    setIsConnected(false);
    setAddress(null);
  };

  return {
    isConnected,
    address,
    connect,
    disconnect,
  };
}

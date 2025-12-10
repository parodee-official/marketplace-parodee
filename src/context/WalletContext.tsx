// src/contexts/WalletContext.tsx
"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { 
  useActiveAccount, 
  useActiveWallet, // <--- TAMBAHKAN INI
  useConnect, 
  useDisconnect 
} from "thirdweb/react";
import { createWallet, WalletId } from "thirdweb/wallets";
import { client } from "@/lib/client";

type WalletContextValue = {
  isConnected: boolean;
  address: string | null;
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet(); // <--- Ambil instance wallet aktif
  
  const { connect: connectThirdweb } = useConnect();
  const { disconnect: disconnectThirdweb } = useDisconnect();

  const isConnected = !!account;
  const address = account?.address || null;

  const connect = async (walletId: WalletId) => {
    try {
      const newWallet = createWallet(walletId); // Ganti nama variable biar tidak bentrok
      await connectThirdweb(async () => {
        await newWallet.connect({ client });
        return newWallet;
      });
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const disconnect = () => {
    // Gunakan objek 'wallet' dari useActiveWallet(), bukan dari account
    if (wallet) {
      disconnectThirdweb(wallet);
    }
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
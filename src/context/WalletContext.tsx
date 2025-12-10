// src/context/WalletContext.tsx
"use client";

import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { 
  ThirdwebProvider, // <--- 1. Import Provider
  useActiveAccount, 
  useActiveWallet,
  useConnect, 
  useDisconnect 
} from "thirdweb/react";
import { createWallet, WalletId } from "thirdweb/wallets";
import { client } from "@/lib/client"; // Ensure this path is correct

type WalletContextValue = {
  isConnected: boolean;
  address: string | null;
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

// 2. We separate the logic into an inner component to safely use hooks
function WalletContextLogic({ children }: { children: ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  
  const { connect: connectThirdweb } = useConnect();
  const { disconnect: disconnectThirdweb } = useDisconnect();

  const isConnected = !!account;
  const address = account?.address || null;

  const connect = async (walletId: WalletId) => {
    try {
      const newWallet = createWallet(walletId);
      await connectThirdweb(async () => {
        await newWallet.connect({ client });
        return newWallet;
      });
    } catch (error) {
      console.error("Connection failed:", error);
      throw error; // Rethrow so your UI can handle the error state
    }
  };

  const disconnect = () => {
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

// 3. The Main Provider export now includes ThirdwebProvider
export function WalletProvider({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider>
      <WalletContextLogic>
        {children}
      </WalletContextLogic>
    </ThirdwebProvider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
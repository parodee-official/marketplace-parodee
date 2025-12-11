// src/context/WalletContext.tsx
"use client";

import {
  createContext,
  useContext,
  type ReactNode,
  useState,
  useEffect
} from "react";
import { 
  ThirdwebProvider, 
  useActiveAccount, 
  useActiveWallet,
  useConnect, 
  useDisconnect,
  useAutoConnect 
} from "thirdweb/react";
import { createWallet, WalletId } from "thirdweb/wallets";
import { client } from "@/lib/client"; 

// Daftar wallet (Harus sama persis dengan opsi di Modal Anda)
const wallets = [
  createWallet("io.metamask"),
  createWallet("walletConnect"),
  createWallet("com.coinbase.wallet"),
  createWallet("app.phantom"),
  createWallet("com.okex.wallet"),
];

type WalletContextValue = {
  isConnected: boolean;
  isConnecting: boolean; // Tambahan state loading
  address: string | null;
  connect: (walletId: WalletId) => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextValue | undefined>(undefined);

function WalletContextLogic({ children }: { children: ReactNode }) {
  const account = useActiveAccount();
  const wallet = useActiveWallet();
  const { connect: connectThirdweb } = useConnect();
  const { disconnect: disconnectThirdweb } = useDisconnect();
  
  // State untuk menangani loading awal AutoConnect
  const [isAutoConnecting, setIsAutoConnecting] = useState(true);

  const { isLoading: autoConnectLoading } = useAutoConnect({
    client,
    wallets,
    onConnect: (w) => {
      console.log("✅ Auto Connect Success:", w.id);
      setIsAutoConnecting(false);
    },
    timeout: 15000, // Tunggu maks 15 detik
  });

  // Effect untuk mematikan loading jika AutoConnect selesai (baik sukses maupun gagal)
  useEffect(() => {
    // Jika useAutoConnect sudah tidak loading, matikan state loading lokal kita
    if (!autoConnectLoading) {
        // Beri jeda sedikit agar state account sempat terupdate
        const timer = setTimeout(() => {
            setIsAutoConnecting(false);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [autoConnectLoading]);

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
      throw error; 
    }
  };

  const disconnect = () => {
    if (wallet) {
      disconnectThirdweb(wallet);
    }
  };

  return (
    <WalletContext.Provider value={{ 
        isConnected, 
        address, 
        connect, 
        disconnect,
        isConnecting: isAutoConnecting 
    }}>
      {children}
    </WalletContext.Provider>
  );
}

export function WalletProvider({ children }: { children: ReactNode }) {
  return (
      <WalletContextLogic>
        {children}
      </WalletContextLogic>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return ctx;
}
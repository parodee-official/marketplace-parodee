"use client";

import HeaderNav from "./HeaderNav";
import Footer from "./Footer";
import BottomTabs from "./BottomTabs";
import { WalletProvider } from "@/context/WalletContext"

type MainLayoutProps = {
  children: React.ReactNode;
};

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <WalletProvider>
      <div className="flex min-h-screen flex-col bg-brand-blue text-black">
        <HeaderNav />

        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 md:pb-8">
            {children}
          </div>
        </main>

        <Footer />
      </div>
    </WalletProvider>
  );
}

// src/components/layout/MainLayout.tsx
"use client";

import { Suspense } from "react"; // 1. Import Suspense
import HeaderNav from "./HeaderNav";
import Footer from "./Footer";
import { ConnectButton } from "thirdweb/react";
import { client } from "@/lib/client";

type MainLayoutProps = {
  children: React.ReactNode;
};

// 2. Buat komponen Fallback sederhana (Tampilan loading sementara navbar)
function HeaderFallback() {
  return (
    <div className="sticky top-0 z-30 h-[88px] w-full bg-brand-blue" />
  );
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-brand-blue text-black">
      
      {/* 3. Bungkus HeaderNav dengan Suspense */}
      <Suspense fallback={<HeaderFallback />}>
        <HeaderNav />
      </Suspense>

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 pb-20 pt-4 md:pb-8">
          {/* AREA TEST (Bisa dihapus jika sudah tidak dipakai) */}
          {/* <div className="p-4 border border-red-500 mb-4">
             <p className="text-red-500 font-bold">TEST AREA (ConnectButton)</p>
             <ConnectButton client={client} />
          </div> */}
          
          {children}
        </div>
      </main>

      <Footer />
    </div>
  );
}
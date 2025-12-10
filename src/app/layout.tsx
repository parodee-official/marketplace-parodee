// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// 1. Import wrapper baru (bukan ThirdwebProvider langsung)
import ThirdwebWrapper from "@/components/ThirdwebWrapper";
import MainLayout from "@/components/layout/MainLayout";


export const metadata: Metadata = {
  title: "Marketplace – Collect & Merch",
  description: "Pixel-art NFT style marketplace for collectibles and merch.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* 2. Gunakan Wrapper di sini */}
        <ThirdwebWrapper>
          <MainLayout>
            {children}
          </MainLayout>
        </ThirdwebWrapper>
      </body>
    </html>
  );
}
// src/app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
// 1. Import wrapper baru (bukan ThirdwebProvider langsung)
import ThirdwebWrapper from "@/components/ThirdwebWrapper";
import { WalletProvider } from "@/context/WalletContext"
import MainLayout from "@/components/layout/MainLayout";


export const metadata: Metadata = {
  title: "Marketplace",
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
        {/*wrapper cok testing yak*/}
        <ThirdwebWrapper>
          <WalletProvider>
          <MainLayout>
            {children}
          </MainLayout>
          </WalletProvider>
        </ThirdwebWrapper>
      </body>
    </html>
  );
}

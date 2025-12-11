// src/app/collect/page.tsx
import { openSeaClient } from "@/lib/opensea";
import CollectPageClient from "@/components/collect/CollectPageClient";
import allNftsData from "@/data/all-pixel.json";

//export default async function CollectPage() {
  //let nfts: any[] = [];
  // changed from opensea to alchemy ehehehe
  //try {
  //  const data: any = await openSeaClient.getCollectionNFTs(
  //    "parodee-pixel-chaos",
  //    100
  //  );
//
  //  nfts = data?.nfts ?? [];
  //} catch (error) {
  //  console.error("[CollectPage] gagal fetch dari OpenSea:", error);
  //}

export default function CollectPage() {
  // Kita kirim seluruh data ke Client Component
  // Tidak ada fetch API = Loading Instan
  const safeData = Array.isArray(allNftsData) ? allNftsData : [allNftsData];
  return <CollectPageClient initialItems={safeData as any[]} />;
}

// src/app/collect/page.tsx
import { openSeaClient } from "@/lib/opensea";
import CollectPageClient from "@/components/collect/CollectPageClient";

export default async function CollectPage() {
  let nfts: any[] = [];

  try {
    const data: any = await openSeaClient.getCollectionNFTs(
      "parodee-pixel-chaos",
      100
    );

    nfts = data?.nfts ?? [];
  } catch (error) {
    console.error("[CollectPage] gagal fetch dari OpenSea:", error);
  }

  return <CollectPageClient initialItems={nfts} />;
}

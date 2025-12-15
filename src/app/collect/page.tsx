// src/app/collect/page.tsx
import { openSeaClient } from "@/lib/opensea";
import CollectPageClient from "@/components/collect/CollectPageClient";
import pixelchaos from "@/data/pixelchaos.json";
import hyperevm from "@/data/hyperevm.json";

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
// 1. Update Tipe Props (searchParams adalah Promise)
type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

// 2. Tambahkan 'async' pada function component
export default async function CollectPage({ searchParams }: Props) {
  
  // 3. AWAIT searchParams sebelum mengakses property-nya
  const resolvedSearchParams = await searchParams;
  const slug = (resolvedSearchParams.slug as string) || "parodee-pixel-chaos";

  // 4. Logika pemilihan data
  let selectedData: any = pixelchaos; // Default

  if (slug === "parodee-hyperevm") {
    selectedData = hyperevm;
  }

  const safeData = Array.isArray(selectedData) ? selectedData : [selectedData];

  // Debugging (Optional)
  console.log("SERVER PAGE LOAD:", {
    slug,
    dataLength: safeData.length,
    firstItemName: safeData[0]?.name 
  });

  return (
    <CollectPageClient 
      // Penting: Key ini memaksa re-render saat slug berubah
      key={slug} 
      initialItems={safeData as any[]} 
      activeSlug={slug} 
    />
  );
}
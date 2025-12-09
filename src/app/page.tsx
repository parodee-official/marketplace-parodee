import { openSeaClient } from "@/lib/opensea";
import Image from "next/image"; // 1. Import the Image component

export default async function Home() {
  let nfts = [];

  try {
    const data = await openSeaClient.getCollectionNFTs('parodee-pixel-chaos');
    console.log(data);
    nfts = data.nfts;
  } catch (error) {
    console.error("Failed to load NFTs:", error);
  }

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Parodee Pixel Chaos</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {nfts?.map((nft: any) => (
          <div key={nft.identifier} className="border rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow bg-white">

            {/* 2. The Image Component */}
            <div className="relative h-64 w-full bg-gray-200">
              {nft.image_url ? (
                <Image
                  src={nft.image_url}
                  alt={nft.name || "NFT Image"}
                  fill // 'fill' makes the image stretch to fit the container
                  className="object-cover" // CSS to ensure it crops nicely
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                // Fallback if no image exists
                <div className="flex items-center justify-center h-full text-gray-400">
                  No Image
                </div>
              )}
            </div>

            <div className="p-4">
              <h2 className="font-bold text-lg truncate">{nft.name || `#${nft.identifier}`}</h2>
              <p className="text-sm text-gray-500 mt-1 truncate">{nft.description}</p>
            </div>

          </div>
        ))}
      </div>
    </main>
  );
}

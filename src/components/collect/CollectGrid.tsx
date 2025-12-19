// src/components/collect/CollectGrid.tsx
"use client";

type CollectGridProps = {
  items: any[]; // NFT dari OpenSea
  onItemClick?: (item: any) => void;
};


export default function CollectGrid({ items, onItemClick }: CollectGridProps) {
  if (!items?.length) return null;

  // console.log("NFT SAMPLE", items[0]);
  return (
    <div className="grid grid-cols-4 gap-4 lg:grid-cols-5 sm:gap-5 md:gap-6">
      {items.map((nft: any) => {
        const displayName = nft.name || `#${nft.identifier}`;
        const imageUrl = nft.image_url || nft.display_image_url;

        return (
          <button
            key={nft.identifier}
            aria-label={displayName}
            onClick={() => onItemClick?.(nft)}
            className="
              relative flex aspect-square w-full cursor-pointer overflow-hidden
              rounded-[18px]  md:rounded-[24px] border-[3px] md:border-[4px] border-black bg-white
              shadow-[3px_3px_0_rgba(0,0,0,1)]
              md:shadow-[6px_6px_0_rgba(0,0,0,1)]
              active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:translate-x-1 hover:translate-y-1 hover:shadow-none
              focus:outline-none
            "
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt={displayName}
                className="h-full w-full object-cover [image-rendering:pixelated]"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-black/10">
                <span className="px-2 text-xs font-semibold text-white drop-shadow-[1px_1px_0_rgba(0,0,0,0.6)] md:text-sm">
                  {displayName}
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

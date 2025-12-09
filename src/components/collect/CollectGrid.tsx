// src/components/collect/CollectGrid.tsx
import type { Collectible } from "@/types/collectible";
import CollectCard from "./CollectCard";

type CollectGridProps = {
  items: Collectible[];
  onItemClick?: (item: Collectible) => void;
};

export default function CollectGrid({ items, onItemClick }: CollectGridProps) {
  return (
    <div className="grid grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:grid-cols-5">
      {items.map((item, index) => (
        <div
          key={`${item.id}-${index}`}
          className="cursor-pointer"
          role="button"
          tabIndex={0}
          aria-label={item.name}
          onClick={() => onItemClick?.(item)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onItemClick?.(item);
            }
          }}
        >
          <CollectCard item={item} />
        </div>
      ))}
    </div>
  );
}

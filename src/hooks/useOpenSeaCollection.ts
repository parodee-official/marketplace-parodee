import { useEffect, useState } from "react";
import { openSeaClient } from "@/lib/opensea";

export function useOpenSeaCollection(slug: string) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    openSeaClient.getCollectionNFTs(slug).then((data) => {
      if (!active) return;
      setItems(data?.nfts ?? []);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [slug]);

  return { items, loading };
}

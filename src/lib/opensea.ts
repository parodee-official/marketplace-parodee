// src/lib/opensea.ts
const API_KEY = process.env.OPENSEA_API_KEY;
const BASE_URL = "https://api.opensea.io/api/v2";

async function fetchOpenSea(endpoint: string, options: RequestInit = {}) {
  // PENTING: Untuk penggunaan di Client Component, pastikan API Key tersedia
  // atau gunakan Server Action. Jika variabel ini undefined di client,
  // Anda perlu menambahkan 'NEXT_PUBLIC_' prefix di .env atau gunakan proxy.
  if (!API_KEY) {
    console.warn("Missing OpenSea API Key. Requests might fail if not proxied.");
  }

  const mergedOptions: RequestInit & { next?: { revalidate?: number } } = {
    ...options,
    headers: {
      accept: "application/json",
      "x-api-key": API_KEY || "",
      ...(options.headers || {}),
    },
    next: { revalidate: 3600, ...(options as any).next },
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

  if (!response.ok) {
    throw new Error(`OpenSea API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const openSeaClient = {
  getCollectionNFTs: async (slug: string, limit = 20) => {
    return fetchOpenSea(`/collection/${slug}/nfts?limit=${limit}`);
  },

  getCollectionTraits: async (slug: string) => {
    return fetchOpenSea(`/traits/${slug}`, {
      next: { revalidate: 3600 }
    });
  },

  getCollectionStats: async (slug: string) => {
    return fetchOpenSea(`/collections/${slug}/stats`);
  },

  getSingleNFT: async (chain: string, address: string, identifier: string) => {
    return fetchOpenSea(`/chain/${chain}/contract/${address}/nfts/${identifier}`);
  },

  // [BARU] Fungsi untuk mengambil riwayat event (sale, transfer, list, dll)
  getNFTEvents: async (chain: string, address: string, identifier: string) => {
    return fetchOpenSea(
      `/events/chain/${chain}/contract/${address}/nfts/${identifier}?limit=20`,
      {
        next: { revalidate: 0 }, // Opsi 1: Revalidate tiap 0 detik (selalu baru)
        cache: 'no-store'        // Opsi 2: Matikan cache browser/server sepenuhnya
      }
    );
  },

  getBestListing: async (chain: string, address: string, identifier: string) => {
     // Listing harga juga harus real-time, jangan di-cache
     return fetchOpenSea(
        `/listings/chain/${chain}/nfts/${address}/${identifier}/best`,
        { cache: 'no-store' }
     );
  },
};

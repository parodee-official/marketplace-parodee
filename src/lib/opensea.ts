// src/lib/opensea.ts
const API_KEY = process.env.OPENSEA_API_KEY;
const BASE_URL = "https://api.opensea.io/api/v2";

async function fetchOpenSea(endpoint: string, options: RequestInit = {}) {
  // PENTING: API Key ini biasanya hanya tersedia di Server Side.
  // Pastikan Anda memanggil fungsi ini lewat Server Action atau API Route.
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
    // Kita return null atau throw error, tergantung preferensi.
    // Throw error memudahkan debugging di server action.
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

  // Fungsi untuk mengambil riwayat event (sale, transfer, list, dll)
  getNFTEvents: async (chain: string, address: string, identifier: string) => {
    return fetchOpenSea(
      `/events/chain/${chain}/contract/${address}/nfts/${identifier}?limit=20`,
      {
        next: { revalidate: 0 }, // Selalu baru
        cache: 'no-store'
      }
    );
  },

  getBestListing: async (chain: string, address: string, identifier: string) => {
     return fetchOpenSea(
        `/listings/chain/${chain}/nfts/${address}/${identifier}/best`,
        { cache: 'no-store' }
     );
  },

  // [BARU] Fungsi untuk mengambil Offers / Bids
  getNFTOffers: async (chain: string, protocol: string, address: string, identifier: string) => {
    // protocol biasanya "seaport"
    return fetchOpenSea(
      `/orders/${chain}/${protocol}/offers?asset_contract_address=${address}&token_ids=${identifier}&order_by=eth_price&order_direction=desc`,
      {
        next: { revalidate: 60 }, // Cache 60 detik agar tidak terlalu sering hit API
      }
    );
  },
};
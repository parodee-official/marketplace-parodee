// src/lib/opensea.ts
const API_KEY = process.env.OPENSEA_API_KEY;
const BASE_URL = "https://api.opensea.io/api/v2";

async function fetchOpenSea(endpoint: string, options: RequestInit = {}) {
  if (!API_KEY) {
    throw new Error("Missing OpenSea API Key in .env.local");
  }

  const mergedOptions: RequestInit & { next?: { revalidate?: number } } = {
    ...options,
    headers: {
      accept: "application/json",
      "x-api-key": API_KEY,
      ...(options.headers || {}),
    },
    next: { revalidate: 60, ...(options as any).next },
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

  getCollectionStats: async (slug: string) => {
    return fetchOpenSea(`/collections/${slug}/stats`);
  },

  getSingleNFT: async (chain: string, address: string, identifier: string) => {
    return fetchOpenSea(`/chain/${chain}/contract/${address}/nfts/${identifier}`);
  },

};




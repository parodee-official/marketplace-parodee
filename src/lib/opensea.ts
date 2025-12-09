const API_KEY = process.env.OPENSEA_API_KEY;
const BASE_URL = 'https://api.opensea.io/api/v2';

// 1. Internal helper to handle the repeated fetch logic
async function fetchOpenSea(endpoint: string, options: RequestInit = {}) {
  if (!API_KEY) {
    throw new Error("Missing OpenSea API Key in .env.local");
  }

  // Merge default headers with any custom options you might pass
  const mergedOptions = {
    ...options,
    headers: {
      accept: 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
    // Next.js Caching: Revalidate data every 60 seconds (optional)
    next: { revalidate: 60, ...options.next }, 
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, mergedOptions);

  if (!response.ok) {
    throw new Error(`OpenSea API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// 2. Export specific functions for your app to use
export const openSeaClient = {
  // Get NFTs from a specific collection
  getCollectionNFTs: async (slug: string, limit = 20) => {
    return fetchOpenSea(`/collection/${slug}/nfts?limit=${limit}`);
  },

  // Get stats (floor price, volume) for a collection
  getCollectionStats: async (slug: string) => {
    return fetchOpenSea(`/collections/${slug}/stats`);
  },

  // Get a single NFT
  getSingleNFT: async (chain: string, address: string, identifier: string) => {
    return fetchOpenSea(`/chain/${chain}/contract/${address}/nfts/${identifier}`);
  }
};
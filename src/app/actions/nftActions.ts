// src/app/actions/nftActions.ts
"use server"; // <--- WAJIB: Menandakan ini berjalan di server

import { openSeaClient } from "@/lib/opensea";

export async function getNFTDetailsAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getSingleNFT(chain, address, identifier);
    return data;
  } catch (error) {
    console.error("Action Error (Detail):", error);
    return null;
  }
}

export async function getNFTEventsAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getNFTEvents(chain, address, identifier);
    return data;
  } catch (error) {
    console.error("Action Error (History):", error);
    return { asset_events: [] };
  }
}

export async function getBestListingAction(chain: string, address: string, identifier: string) {
  try {
    const data = await openSeaClient.getBestListing(chain, address, identifier);
    return data;
  } catch (error) {
    // Return null biasa jika gagal, supaya tidak merusak flow
    return null;
  }
}

export async function getCollectionTraitsAction(slug: string) {
  try {
    const data = await openSeaClient.getCollectionTraits(slug);
    return data;
  } catch (error) {
    console.error("Error fetching collection traits:", error);
    return null;
  }
}

export async function getNFTDetailAction(chain: string, address: string, identifier: string) {
  try {
    // Memanggil fungsi OpenSea Client yang sudah Anda buat
    const data = await openSeaClient.getSingleNFT(chain, address, identifier);

    // Normalisasi return value (kadang dibungkus object 'nft', kadang langsung)
    return data.nft || data;
  } catch (error) {
    console.error("Gagal fetch detail NFT:", error);
    return null;
  }
}

// [BARU] Action untuk mengambil Offers (Bids Tab)
export async function getNFTOffersAction(chain: string, address: string, identifier: string) {
  try {
    // Protocol hardcoded ke 'seaport' karena itu standar OpenSea saat ini
    const data = await openSeaClient.getNFTOffers(chain, "seaport", address, identifier);
    return data;
  } catch (error) {
    console.error("Error fetching NFT offers:", error);
    return { orders: [] }; // Return array kosong biar UI tidak error
  }
}
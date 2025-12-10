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

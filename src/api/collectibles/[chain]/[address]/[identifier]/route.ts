// src/app/api/collectibles/[chain]/[address]/[identifier]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { openSeaClient } from "@/lib/opensea";

type RouteParams = {
  params: {
    chain: string;
    address: string;
    identifier: string;
  };
};

export async function GET(_req: NextRequest, { params }: RouteParams) {
  const { chain, address, identifier } = params;

  if (!chain || !address || !identifier) {
    return NextResponse.json(
      { error: "Missing required parameters (chain, address, identifier)" },
      { status: 400 }
    );
  }

  try {
    // Ambil detail NFT dari OpenSea
    const raw = await openSeaClient.getSingleNFT(chain, address, identifier);

    // OpenSea v2 biasanya bungkus di { nft: {...} }, tapi kita buat safe
    const nft: any = (raw as any)?.nft ?? raw ?? {};

    // Normalisasi traits jadi { name, value } supaya
    // frontend bisa pakai shape yang sama tanpa ubah UI
    const rawTraits =
      nft?.traits ??
      nft?.metadata?.traits ??
      [];

    const traits = Array.isArray(rawTraits)
      ? rawTraits.map((t: any) => ({
          name: t.name ?? t.trait_type ?? "",
          value: t.value ?? t.trait_value ?? "",
        }))
      : [];

    const payload = {
      ...nft,
      traits,
    };

    return NextResponse.json({ nft: payload });
  } catch (error) {
    console.error(
      "[GET /api/collectibles/[chain]/[address]/[identifier]] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to fetch NFT detail from OpenSea" },
      { status: 500 }
    );
  }
}

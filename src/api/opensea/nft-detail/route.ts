// src/app/api/opensea/nft-detail/route.ts
import { NextResponse } from "next/server";

const API_KEY = process.env.OPENSEA_API_KEY;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const chain = searchParams.get("chain") || "ethereum";
  const address = searchParams.get("address");
  const tokenId = searchParams.get("tokenId");

  if (!address || !tokenId) {
    return NextResponse.json(
      { error: "address & tokenId wajib diisi" },
      { status: 400 }
    );
  }

  if (!API_KEY) {
    return NextResponse.json(
      { error: "OPENSEA_API_KEY belum diset" },
      { status: 500 }
    );
  }

  try {
    // endpoint metadata detail 1 NFT
    const metadataUrl = `https://api.opensea.io/api/v2/metadata/${chain}/${address}/${tokenId}`;
    // endpoint events / history 1 NFT
    const eventsUrl = `https://api.opensea.io/api/v2/events/chain/${chain}/contract/${address}/nfts/${tokenId}`;

    const [metaRes, eventsRes] = await Promise.all([
      fetch(metadataUrl, {
        headers: {
          "x-api-key": API_KEY,
          accept: "application/json",
        },
      }),
      fetch(eventsUrl, {
        headers: {
          "x-api-key": API_KEY,
          accept: "application/json",
        },
      }),
    ]);

    if (!metaRes.ok) {
      const text = await metaRes.text();
      console.error("Metadata error:", text);
      return NextResponse.json(
        { error: "Gagal fetch metadata NFT" },
        { status: 500 }
      );
    }

    const metadata = await metaRes.json();
    const events = eventsRes.ok ? await eventsRes.json() : { events: [] };

    return NextResponse.json({ metadata, events });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

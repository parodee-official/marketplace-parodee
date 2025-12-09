import { NextRequest, NextResponse } from "next/server";
import { openSeaClient } from "@/lib/opensea";

const COLLECTION_SLUG = "parodee-pixel-chaos";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get("page") ?? "1";
  const limitParam = searchParams.get("limit") ?? "25";
  const search = (searchParams.get("search") ?? "").toLowerCase().trim();

  const page = Number(pageParam) || 1;
  const limitRaw = Number(limitParam) || 25;
  const limit = Math.min(limitRaw, 100);

  try {
    // OpenSea pakai cursor, jadi untuk simple pagination:
    // ambil "limit * page" lalu slice manual di sini
    const fetchLimit = limit * page;

    const data: any = await openSeaClient.getCollectionNFTs(
      COLLECTION_SLUG,
      fetchLimit
    );

    let nfts: any[] = data?.nfts ?? [];

    // simple search by name / identifier / collection slug
    if (search) {
      nfts = nfts.filter((nft) => {
        const name = (nft.name ?? "").toLowerCase();
        const id = String(nft.identifier ?? "").toLowerCase();
        const collection = String(nft.collection ?? "").toLowerCase();
        return (
          name.includes(search) ||
          id.includes(search) ||
          collection.includes(search)
        );
      });
    }

    const total = nfts.length;
    const start = (page - 1) * limit;
    const end = start + limit;
    const items = nfts.slice(start, end);

    return NextResponse.json({
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("[GET /api/collectibles] OpenSea error:", error);
    return NextResponse.json(
      { message: "Failed to fetch collectibles from OpenSea" },
      { status: 500 }
    );
  }
}

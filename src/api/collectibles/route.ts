import { NextRequest, NextResponse } from "next/server";
import { openSeaClient } from "@/lib/opensea";

// 1. Define allowed collections to prevent random API abuse
const ALLOWED_COLLECTIONS = {
  pixel: "parodee-pixel-chaos",
  hyperevm: "parodee-hyperevm",
};

// Default collection if none is specified
const DEFAULT_SLUG = ALLOWED_COLLECTIONS.pixel;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // 2. Get the 'slug' param from the URL
  const requestedSlug = searchParams.get("slug");

  // 3. Validate: If the requested slug is not in our allowed list, use the default
  const targetCollection =
    Object.values(ALLOWED_COLLECTIONS).includes(requestedSlug as string)
      ? requestedSlug
      : DEFAULT_SLUG;

  const pageParam = searchParams.get("page") ?? "1";
  const limitParam = searchParams.get("limit") ?? "25";
  const search = (searchParams.get("search") ?? "").toLowerCase().trim();

  const page = Number(pageParam) || 1;
  const limitRaw = Number(limitParam) || 25;
  const limit = Math.min(limitRaw, 100);

  try {
    // OpenSea uses cursor, so for simple pagination:
    // fetch "limit * page" and slice manually
    const fetchLimit = limit * page;

    // 4. Use the dynamic 'targetCollection' variable instead of the constant
    const data: any = await openSeaClient.getCollectionNFTs(
      targetCollection!, 
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
      collection: targetCollection, // Optional: return which collection was fetched
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error(`[GET /api/collectibles] OpenSea error (${targetCollection}):`, error);
    return NextResponse.json(
      { message: "Failed to fetch collectibles from OpenSea" },
      { status: 500 }
    );
  }
}
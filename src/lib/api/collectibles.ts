// src/lib/api/collectibles.ts

import {
  Collectible,
  PaginatedResponse,
  GetCollectiblesParams,
} from "@/types/collectible";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

// Generic helper untuk call API backend
async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${path}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    // bisa di-extend nanti (auth, signature, dsb.)
    ...init,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API error ${res.status}: ${text}`);
  }

  return (await res.json()) as T;
}

// ====== LIST COLLECTIBLES ======

export async function getCollectibles(
  params: GetCollectiblesParams = {}
): Promise<PaginatedResponse<Collectible>> {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  if (params.search) query.set("search", params.search);
  if (params.sort) query.set("sort", params.sort);

  if (params.filters?.collections?.length) {
    query.set("collections", params.filters.collections.join(","));
  }

  if (params.filters?.minPriceEth != null) {
    query.set("minPriceEth", String(params.filters.minPriceEth));
  }

  if (params.filters?.maxPriceEth != null) {
    query.set("maxPriceEth", String(params.filters.maxPriceEth));
  }

  // NOTE: untuk traits, nanti bisa kita sepakati format dengan backend:
  // - opsi 1: traits sebagai JSON string di query: traits={..}
  // - opsi 2: POST /collectibles/search dengan body JSON
  //
  // Untuk sekarang, kita skip dulu biar simple.

  const qs = query.toString();
  const path = `/collectibles${qs ? `?${qs}` : ""}`;

  return apiFetch<PaginatedResponse<Collectible>>(path);
}

// ====== DETAIL COLLECTIBLE BY ID ======

export async function getCollectibleById(
  id: string
): Promise<Collectible> {
  return apiFetch<Collectible>(`/collectibles/${id}`);
}

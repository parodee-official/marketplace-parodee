// src/types/collectible.ts
export type Rarity = "common" | "rare" | "epic" | "legendary";

export type CollectibleTrait = {
  name: string;
  value: string;
};

export type CollectibleStatus = "listed" | "sold" | "not_for_sale";

export type Collectible = {
  id: string;
  name: string;
  imageUrl: string;
  collection: string;
  rarity: Rarity;
  priceEth?: number;
  status?: CollectibleStatus;
  traits?: CollectibleTrait[];
  bgColor?: string; // warna background card
};


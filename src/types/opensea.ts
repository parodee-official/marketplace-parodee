// types/opensea.ts
export type OpenSeaNFT = {
  collection: string;        // slug, contoh: "parodee-pixel-chaos"
  contract: string;
  description: string | null;
  display_animation_url: string | null;
  display_image_url: string | null;
  identifier: string;        // token id
  image_url: string | null;
  is_disabled: boolean;
  is_nsfw: boolean;
  metadata_url: string | null;
  name: string | null;
  opensea_url: string;
  token_standard: string;
  updated_at: string;
};

export type OpenSeaNFTResponse = {
  nfts: OpenSeaNFT[];
  // kalau ada field lain di response, bisa ditambahin nanti
};

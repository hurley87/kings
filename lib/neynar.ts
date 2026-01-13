import { env } from "@/lib/env";
import { buildCacheKey, cacheGetOrSet, CacheTTL } from "@/lib/cache";

export interface NeynarUser {
  fid: string;
  username: string;
  display_name: string;
  pfp_url: string;
  custody_address: string;
  verifications: string[];
}

async function fetchUserFromNeynar(fid: string): Promise<NeynarUser> {
  const response = await fetch(
    `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
    {
      headers: {
        "x-api-key": env.NEYNAR_API_KEY!,
      },
    }
  );
  if (!response.ok) {
    console.error(
      "Failed to fetch Farcaster user on Neynar",
      await response.json()
    );
    throw new Error("Failed to fetch Farcaster user on Neynar");
  }
  const data = await response.json();
  return data.users[0];
}

export const fetchUser = async (fid: string): Promise<NeynarUser> => {
  const cacheKey = buildCacheKey("neynar:user", fid);
  return cacheGetOrSet(cacheKey, () => fetchUserFromNeynar(fid), CacheTTL.MEDIUM);
};

export const fetchUserFresh = async (fid: string): Promise<NeynarUser> => {
  return fetchUserFromNeynar(fid);
};

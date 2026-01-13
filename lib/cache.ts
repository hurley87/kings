import { redis } from "./redis";

export const CACHE_PREFIX = "cache";

export const CacheTTL = {
  SHORT: 60, // 1 minute - volatile data
  MEDIUM: 300, // 5 minutes - user profiles
  LONG: 900, // 15 minutes - contract balances
  VERY_LONG: 3600, // 1 hour - token metadata
} as const;

export function buildCacheKey(
  prefix: string,
  ...parts: (string | number)[]
): string {
  return `${CACHE_PREFIX}:${prefix}:${parts.join(":")}`;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) {
    return null;
  }
  try {
    return await redis.get<T>(key);
  } catch (error) {
    console.error(`Cache get error for key ${key}:`, error);
    return null;
  }
}

export async function cacheSet<T>(
  key: string,
  value: T,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<void> {
  if (!redis) {
    return;
  }
  try {
    await redis.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error(`Cache set error for key ${key}:`, error);
  }
}

export async function cacheDelete(key: string): Promise<void> {
  if (!redis) {
    return;
  }
  try {
    await redis.del(key);
  } catch (error) {
    console.error(`Cache delete error for key ${key}:`, error);
  }
}

export async function cacheGetOrSet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = CacheTTL.MEDIUM
): Promise<T> {
  const cached = await cacheGet<T>(key);
  if (cached !== null) {
    return cached;
  }

  const fresh = await fetcher();

  // Cache in background
  cacheSet(key, fresh, ttlSeconds).catch(() => {
    // Already logged in cacheSet
  });

  return fresh;
}

export async function cacheGetMany<T>(keys: string[]): Promise<(T | null)[]> {
  if (!redis || keys.length === 0) {
    return keys.map(() => null);
  }
  try {
    return await redis.mget<T[]>(...keys);
  } catch (error) {
    console.error(`Cache mget error:`, error);
    return keys.map(() => null);
  }
}

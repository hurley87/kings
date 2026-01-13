import {
  createPublicClient,
  http,
  type PublicClient,
  type Chain,
  type Abi,
} from "viem";
import { mainnet, base, optimism, baseSepolia } from "viem/chains";
import { buildCacheKey, cacheGetOrSet, CacheTTL } from "@/lib/cache";

export { CacheTTL };

const chains: Record<number, Chain> = {
  [mainnet.id]: mainnet,
  [base.id]: base,
  [optimism.id]: optimism,
  [baseSepolia.id]: baseSepolia,
};

const clientCache = new Map<number, PublicClient>();

export function getPublicClient(chainId: number): PublicClient {
  if (!clientCache.has(chainId)) {
    const chain = chains[chainId];
    if (!chain) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }
    clientCache.set(
      chainId,
      createPublicClient({
        chain,
        transport: http(),
      })
    );
  }
  return clientCache.get(chainId)!;
}

function hashArgs(args: unknown[]): string {
  if (!args || args.length === 0) return "noargs";
  const str = JSON.stringify(args, (_, v) =>
    typeof v === "bigint" ? v.toString() : v
  );
  return Buffer.from(str).toString("base64url").slice(0, 20);
}

export interface CachedReadOptions {
  chainId: number;
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  ttl?: number;
}

export async function cachedReadContract<TResult = unknown>(
  options: CachedReadOptions
): Promise<TResult> {
  const {
    chainId,
    address,
    abi,
    functionName,
    args = [],
    ttl = CacheTTL.LONG,
  } = options;

  const cacheKey = buildCacheKey(
    "contract:read",
    chainId,
    address.toLowerCase(),
    functionName,
    hashArgs(args)
  );

  return cacheGetOrSet<TResult>(
    cacheKey,
    async () => {
      const client = getPublicClient(chainId);
      const result = await client.readContract({
        address,
        abi,
        functionName,
        args,
      });
      return result as TResult;
    },
    ttl
  );
}

const ERC20_ABI = [
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ type: "string" }],
    stateMutability: "view",
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ type: "uint8" }],
    stateMutability: "view",
  },
] as const;

export async function cachedGetTokenMetadata(
  chainId: number,
  tokenAddress: `0x${string}`
): Promise<{ name: string; symbol: string; decimals: number }> {
  const [name, symbol, decimals] = await Promise.all([
    cachedReadContract<string>({
      chainId,
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "name",
      ttl: CacheTTL.VERY_LONG,
    }),
    cachedReadContract<string>({
      chainId,
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "symbol",
      ttl: CacheTTL.VERY_LONG,
    }),
    cachedReadContract<number>({
      chainId,
      address: tokenAddress,
      abi: ERC20_ABI,
      functionName: "decimals",
      ttl: CacheTTL.VERY_LONG,
    }),
  ]);

  return { name, symbol, decimals };
}

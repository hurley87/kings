import { useApiQuery } from "./use-api-query";
import type { Abi } from "viem";

interface UseCachedContractReadOptions {
  chainId: number;
  address: `0x${string}`;
  abi: Abi;
  functionName: string;
  args?: unknown[];
  ttl?: number;
  enabled?: boolean;
}

interface ContractReadResult<TResult> {
  result: TResult;
}

export function useCachedContractRead<TResult = unknown>(
  options: UseCachedContractReadOptions
) {
  const {
    chainId,
    address,
    abi,
    functionName,
    args = [],
    ttl,
    enabled = true,
  } = options;

  return useApiQuery<ContractReadResult<TResult>>({
    queryKey: [
      "contract",
      chainId,
      address,
      functionName,
      JSON.stringify(args),
    ],
    url: "/api/contract/read",
    method: "POST",
    body: { chainId, address, abi, functionName, args, ttl },
    enabled,
  });
}

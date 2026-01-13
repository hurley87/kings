import { NextRequest, NextResponse } from "next/server";
import { cachedReadContract, CacheTTL } from "@/lib/cached-contract";
import { z } from "zod";
import type { Abi } from "viem";

const requestSchema = z.object({
  chainId: z.number(),
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  abi: z.array(z.record(z.string(), z.unknown())),
  functionName: z.string(),
  args: z.array(z.unknown()).optional(),
  ttl: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = requestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request", details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { chainId, address, abi, functionName, args = [], ttl } = parsed.data;

    const result = await cachedReadContract({
      chainId,
      address: address as `0x${string}`,
      abi: abi as unknown as Abi,
      functionName,
      args,
      ttl: ttl ?? CacheTTL.LONG,
    });

    return NextResponse.json({
      result: JSON.parse(
        JSON.stringify(result, (_, v) =>
          typeof v === "bigint" ? v.toString() : v
        )
      ),
    });
  } catch (error) {
    console.error("Contract read error:", error);
    return NextResponse.json(
      { error: "Contract read failed" },
      { status: 500 }
    );
  }
}

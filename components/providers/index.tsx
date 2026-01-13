"use client";

import { EnvironmentProvider } from "@/contexts/environment-context";
import { FarcasterProvider } from "@/contexts/farcaster-context";
import { UserProvider } from "@/contexts/user-context";
import { wagmiConfigMiniApp } from "@/lib/wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cookieToInitialState, WagmiProvider } from "wagmi";
import { ErudaProvider } from "./eruda";

const queryClient = new QueryClient();

export default function Providers({
  children,
  cookie,
}: {
  children: React.ReactNode;
  cookie: string | null;
}) {
  const initialState = cookieToInitialState(wagmiConfigMiniApp, cookie);
  return (
    <EnvironmentProvider>
      <ErudaProvider>
        <WagmiProvider config={wagmiConfigMiniApp} initialState={initialState}>
          <QueryClientProvider client={queryClient}>
            <FarcasterProvider addMiniAppOnLoad={false}>
              <UserProvider autoSignIn={true}>{children}</UserProvider>
            </FarcasterProvider>
          </QueryClientProvider>
        </WagmiProvider>
      </ErudaProvider>
    </EnvironmentProvider>
  );
}

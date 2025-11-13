"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { ReactNode, useEffect, useState } from "react";

// Initialize Convex client - will validate at runtime
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const convex = new ConvexReactClient(convexUrl);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [isValidated, setIsValidated] = useState(false);

  useEffect(() => {
    // Client-side validation of required environment variables
    if (typeof window !== "undefined") {
      if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
        console.error("Missing NEXT_PUBLIC_CONVEX_URL environment variable");
      }
      if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) {
        console.error("Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable");
      }
      setIsValidated(true);
    }
  }, []);

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}

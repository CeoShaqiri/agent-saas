import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    // Dynamically import Clerk's getAuth only when a Clerk secret is configured.
    // When running locally without Clerk keys, this prevents the Clerk SDK
    // from throwing and allows dev flows (like Stripe dev fallback) to work.
    let userId: string | null = null;
    let email: string | null = null;
    if (process.env.CLERK_SECRET_KEY) {
      try {
        const mod = await import("@clerk/nextjs/server");
        const auth = mod.getAuth(req as any);
        userId = auth.userId || null;
        email =
          (auth as any)?.email ||
          (auth as any)?.primaryEmailAddress?.email ||
          null;
      } catch (e) {
        // If Clerk import or getAuth fails, treat as unauthenticated.
        userId = null;
        email = null;
      }
    }

    const sub = await prisma.subscription.findFirst({
      where: {
        OR: [{ clerkId: userId || undefined }, { email: email || undefined }],
      },
    });
    const isSubscribed = !!sub && sub.status === "active";
    return NextResponse.json({ subscribed: isSubscribed });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

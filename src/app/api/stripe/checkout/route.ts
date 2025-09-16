import Stripe from "stripe";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" })
  : null;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, user_id } = body as { email?: string; user_id?: string };

    const origin = req.headers.get("origin") || `http://localhost:3000`;

    if (!stripe) {
      // Dev fallback when Stripe key is not configured. Return a fake session
      // so the client can continue the checkout UI flow in local dev.
      const fakeId = `fake_sess_${Date.now()}`;
      const origin = req.headers.get("origin") || `http://localhost:3000`;
      // Persist an active subscription so the app treats the user as subscribed
      try {
        await prisma.subscription.upsert({
          where: { id: user_id || email || `dev_${fakeId}` },
          update: {
            status: "active",
            stripeCustomerId: null,
            clerkId: user_id || undefined,
            email: email || undefined,
          },
          create: {
            id: user_id || email || `dev_${fakeId}`,
            clerkId: user_id || undefined,
            email: email || undefined,
            stripeCustomerId: null,
            status: "active",
          },
        });
      } catch (e) {
        // ignore persistence errors in dev fallback
        // eslint-disable-next-line no-console
        console.warn("Dev checkout: failed to persist subscription", e);
      }

      return NextResponse.json({
        sessionId: fakeId,
        url: `${origin}/success?session_id=${fakeId}`,
        _devFallback: true,
      });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription",
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      customer_email: email || undefined,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cancel`,
      metadata: { user_id: user_id || "" },
    });

    return NextResponse.json({ sessionId: session.id, url: session.url });
  } catch (e: any) {
    return NextResponse.json(
      { error: "Stripe error", details: String(e?.message || e) },
      { status: 500 }
    );
  }
}

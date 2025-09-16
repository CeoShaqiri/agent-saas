import Stripe from "stripe";
import { NextResponse } from "next/server";

const stripeKey = process.env.STRIPE_SECRET_KEY || "";
const stripe = stripeKey
  ? new Stripe(stripeKey, { apiVersion: "2025-08-27.basil" })
  : null;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const sessionId = url.searchParams.get("session_id");
    if (!sessionId)
      return NextResponse.json(
        { error: "session_id required" },
        { status: 400 }
      );
    if (!stripe && sessionId?.startsWith("fake_sess_")) {
      // Dev fake session payload so client code can render a success flow
      const fakeSession = {
        id: sessionId,
        customer: null,
        subscription: { id: `fake_sub_${Date.now()}`, status: "active" },
        payment_status: "paid",
      } as const;
      return NextResponse.json({ session: fakeSession });
    }

    const session = await stripe!.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    });
    return NextResponse.json({ session });
  } catch (e: any) {
    return NextResponse.json(
      { error: String(e?.message || e) },
      { status: 500 }
    );
  }
}

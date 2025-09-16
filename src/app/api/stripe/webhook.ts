import { NextApiRequest, NextApiResponse } from "next";
import Stripe from "stripe";
import { buffer } from "micro";
import path from "path";
import fs from "fs/promises";
import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-08-27.basil",
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).end("Method Not Allowed");
  }
  const sig = req.headers["stripe-signature"];
  const buf = await buffer(req);
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      sig as string,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle subscription events and persist to data/subscriptions.json (dev shim)
  const SUBS_FILE = path.join(process.cwd(), "data", "subscriptions.json");
  async function readJson(p: string) {
    try {
      return JSON.parse((await fs.readFile(p, "utf8")) || "{}");
    } catch (e) {
      return null;
    }
  }
  async function writeJson(p: string, data: any) {
    await fs.mkdir(path.dirname(p), { recursive: true });
    await fs.writeFile(p, JSON.stringify(data, null, 2), "utf8");
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const user_id = session.metadata?.user_id || "";
    const email = session.customer_email || "";
    const stripe_customer_id = String(session.customer || "");
    // persist to db
    await prisma.subscription.upsert({
      where: { id: user_id || stripe_customer_id || "" },
      update: {
        status: "active",
        stripeCustomerId: stripe_customer_id || undefined,
        email: email || undefined,
        clerkId: user_id || undefined,
      },
      create: {
        clerkId: user_id || undefined,
        email: email || undefined,
        stripeCustomerId: stripe_customer_id || undefined,
        status: "active",
      },
    });
  }
  if (
    event.type === "customer.subscription.updated" ||
    event.type === "customer.subscription.deleted"
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const user_id = subscription.metadata?.user_id || "";
    const status = subscription.status;
    await prisma.subscription.updateMany({
      where: { clerkId: user_id || undefined },
      data: { status },
    });
  }
  res.status(200).json({ received: true });
}

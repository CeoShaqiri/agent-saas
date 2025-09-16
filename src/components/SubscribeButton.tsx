"use client";
import React, { useState } from "react";
import { useUser } from "@clerk/clerk-react";

export default function SubscribeButton() {
  const [loading, setLoading] = useState(false);
  const { isSignedIn, user } = useUser();

  async function handleSubscribe() {
    setLoading(true);
    try {
      if (!isSignedIn) {
        // Redirect to sign-in so Clerk can attach user metadata to the checkout
        window.location.href = "/auth/sign-in";
        return;
      }
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Include Clerk user email and id so webhook can attach subscriber
        body: JSON.stringify({
          email:
            // primaryEmailAddress isn't always set in every Clerk SDK version
            user?.primaryEmailAddress?.emailAddress ||
            user?.emailAddresses?.[0]?.emailAddress ||
            null,
          user_id: user?.id || null,
        }),
      });
      const data = await res.json();
      if (data?.url) {
        // Redirect browser to Stripe Checkout
        window.location.href = data.url;
      } else if (data?.sessionId) {
        // Fallback: open checkout using session id if url not returned
        window.location.href = `/success?session_id=${data.sessionId}`;
      } else {
        alert("Unable to start checkout. Please try again later.");
      }
    } catch (err) {
      console.error("Checkout error", err);
      alert("Checkout failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={loading}
      className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition text-lg disabled:opacity-60"
    >
      {loading ? "Starting checkout..." : "Subscribe / Pay now"}
    </button>
  );
}

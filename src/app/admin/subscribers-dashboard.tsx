import { useEffect, useState } from "react";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/nextjs";
import { Card } from "@/components/ui/card";

export default function SubscribersDashboard() {
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/list_subscribers")
      .then((res) => res.json())
      .then((data) => {
        setSubscribers(data.subscribers?.metadatas || []);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <SignedIn>
        <section className="p-8">
          <h1 className="text-2xl font-bold mb-6">Subscribers Dashboard</h1>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {subscribers.map((sub, idx) => (
                <Card key={idx} className="p-4">
                  <div>
                    <b>Email:</b> {sub.email}
                  </div>
                  <div>
                    <b>Stripe ID:</b> {sub.stripe_customer_id}
                  </div>
                  <div>
                    <b>Status:</b> {sub.status}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
}

import React from "react";

export default function CancelPage() {
  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Checkout cancelled</h1>
      <p className="text-zinc-300">
        Your purchase was cancelled. You can try again or contact support.
      </p>
      <div className="mt-6">
        <a
          href="/agent-chat-demo"
          className="bg-indigo-500 text-white px-6 py-2 rounded-lg"
        >
          Back to Agent Chat
        </a>
      </div>
    </div>
  );
}

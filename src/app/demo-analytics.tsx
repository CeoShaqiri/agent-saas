import React from "react";

export default function DemoAnalytics() {
  return (
    <div className="bg-zinc-900 rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto mt-12 animate-fade-in">
      <div className="mb-4 text-center">
        <span className="bg-yellow-500 text-white px-4 py-2 rounded-full font-bold">
          Demo Mode: Limited Results
        </span>
      </div>
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">
        Sample Analytics
      </h2>
      <div className="grid grid-cols-2 gap-8 mb-8">
        <StatCard label="Leads Generated" value="12" />
        <StatCard label="Content Pieces" value="5" />
        <StatCard label="Sales Opportunities" value="3" />
        <StatCard label="Finance Insights" value="2" />
      </div>
      <div className="text-center mt-6">
        <div className="text-indigo-300 font-semibold mb-2">
          Want to see full analytics and real results?
        </div>
        <a
          href="#contact"
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition text-lg"
        >
          Unlock Full Results
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center shadow-md">
      <div className="text-4xl font-extrabold text-indigo-400 mb-2">
        {value}
      </div>
      <div className="text-lg text-white font-semibold">{label}</div>
    </div>
  );
}

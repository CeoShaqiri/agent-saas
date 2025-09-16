import DemoLanding from "./demo-landing";
import AgentPromoUI from "./AgentPromoUI";
import AgentMarketplace from "./AgentMarketplace";
import AgentCollabDemo from "./AgentCollabDemo";

export default function Page() {
  return (
    <div className="space-y-16">
      <section>
        <DemoLanding />
      </section>
      <section>
        <h2 className="text-3xl font-bold text-center mb-6 text-indigo-400">
          Your Free Professional Answers
        </h2>
        <AgentPromoUI />
      </section>
      <section>
        <h2 className="text-3xl font-bold text-center mb-6 text-pink-400">
          AI Agent Marketplace
        </h2>
        <AgentMarketplace />
      </section>
      <section>
        <h2 className="text-3xl font-bold text-center mb-6 text-yellow-400">
          Real-Time Team Collaboration
        </h2>
        <AgentCollabDemo />
      </section>
    </div>
  );
}

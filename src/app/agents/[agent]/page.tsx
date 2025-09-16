import AgentChatDemo from "@/app/agent-chat-demo";

// Server component: read the route `agent` param and pass it to the client chat
// so the client can initialize synchronously without flashing the demo agent.
export default function AgentPage({ params }: { params: { agent?: string } }) {
  const agentKey = params?.agent;
  return <AgentChatDemo initialAgent={agentKey} />;
}

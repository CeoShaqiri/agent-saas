import { UserProfile } from "@clerk/nextjs";

export default function ProfilePage() {
  return (
    <section className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-transparent">
      <div className="w-full max-w-2xl rounded-lg border bg-card p-6 shadow-md">
        <UserProfile appearance={{ variables: { colorPrimary: "#6366f1" } }} />
      </div>
    </section>
  );
}

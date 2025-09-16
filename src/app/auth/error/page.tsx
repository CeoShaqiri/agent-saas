"use client";
export default function AuthErrorPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Authentication Error</h1>
      <p className="mb-2">
        Something went wrong during sign-in. Please try again or contact
        support.
      </p>
      <a href="/auth/sign-in" className="text-blue-600 underline">
        Back to Sign In
      </a>
    </div>
  );
}

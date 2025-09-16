import { NextResponse } from "next/server";

// By default use a no-op middleware to avoid runtime failures when Clerk
// environment variables are not configured in local development.
let _middleware: (...args: any[]) => any = (..._args: any[]) => NextResponse.next();

if (process.env.CLERK_SECRET_KEY) {
  // Dynamically import Clerk only when a secret key is present. If the
  // import or initialization fails, fall back to the no-op middleware.
  import("@clerk/nextjs/server")
    .then((mod) => {
      try {
        // clerkMiddleware returns a NextMiddleware which accepts (req, ev)
        const mw = mod.clerkMiddleware();
        _middleware = function () {
          // use apply to avoid tuple spread type issues
          // @ts-ignore intentionally loose for dev-time fallback
          return mw.apply(this, arguments as any);
        };
      } catch (e) {
        // keep no-op
        // eslint-disable-next-line no-console
        console.warn("Clerk middleware init failed, using no-op", e);
        _middleware = (..._args: any[]) => NextResponse.next();
      }
    })
    .catch((e) => {
      // eslint-disable-next-line no-console
      console.warn("Clerk middleware import failed, using no-op", e);
      _middleware = (req: any) => NextResponse.next();
    });
}

export default function middleware(req: any) {
  return _middleware(req);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
  // Always run for API routes
  "/(api|trpc)(.*)",
  ],
};

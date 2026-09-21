import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const isAuthed = Boolean(req.auth?.user);
  const { pathname } = req.nextUrl;

  if ((pathname === "/sign-in" || pathname === "/sign-up") && isAuthed) {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  // Defense in depth alongside each admin page's own requireAdmin() check —
  // the middleware's session doesn't include a fresh DB round trip, so the
  // page-level check remains the source of truth, but this stops an
  // unauthenticated/non-admin request before it ever renders anything.
  if (pathname.startsWith("/admin") && req.auth?.user?.systemRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/sign-in", "/sign-up", "/admin/:path*"],
};

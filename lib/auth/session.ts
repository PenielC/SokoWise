import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { capabilities, type SessionUser } from "@/lib/rbac";

/**
 * Returns the signed-in user (or null) without redirecting — for pages/UI
 * that work either way.
 *
 * sellerId is looked up fresh from the database on every call rather than
 * carried in the JWT: Auth.js's `jwt` callback only re-runs on token
 * issuance/refresh, not on every plain `auth()` read, so a value cached
 * there would show stale seller status immediately after a user registers
 * as a seller (the redirect straight back into the same request cycle
 * doesn't get a re-signed cookie in time). One extra indexed lookup per
 * request is a fine trade for always-correct capability checks.
 */
export async function getCurrentUser(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const seller = await prisma.seller.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  return {
    id: session.user.id,
    systemRole: session.user.systemRole,
    sellerId: seller?.id ?? null,
  };
}

/** Returns the signed-in user, redirecting to sign-in (with a return path) otherwise. */
export async function requireUser(currentPath?: string): Promise<NonNullable<SessionUser>> {
  const user = await getCurrentUser();
  if (!user) {
    const signInUrl = currentPath ? `/sign-in?from=${encodeURIComponent(currentPath)}` : "/sign-in";
    redirect(signInUrl);
  }
  return user;
}

/** Returns the signed-in admin user, redirecting non-admins away otherwise. */
export async function requireAdmin(currentPath?: string): Promise<NonNullable<SessionUser>> {
  const user = await requireUser(currentPath);
  if (!capabilities.canModerate(user)) {
    redirect("/");
  }
  return user;
}

export class ForbiddenError extends Error {}

export type SessionUser = {
  id: string;
  systemRole: "USER" | "ADMIN";
  sellerId: string | null;
} | null;

// Capability-based, not a linear hierarchy — SELLER and COMMUNITY_CONTRIBUTOR
// aren't ordered, and a user can hold both simultaneously. Community
// capability is implicit (any authenticated user); seller capability is the
// presence of a linked Seller record; admin is the one binary system rank.
export const capabilities = {
  canSubmitCommunityReport: (user: SessionUser) => Boolean(user),
  canConfirmOrFlag: (user: SessionUser) => Boolean(user),
  canRegisterSeller: (user: SessionUser) => Boolean(user) && !user!.sellerId,
  canManageSellerListings: (user: SessionUser) => Boolean(user?.sellerId),
  canModerate: (user: SessionUser) => user?.systemRole === "ADMIN",
};

export function requireCapability(ok: boolean, message: string): void {
  if (!ok) throw new ForbiddenError(message);
}

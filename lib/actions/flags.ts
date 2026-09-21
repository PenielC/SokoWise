"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { isUniqueConstraintError } from "@/lib/db/errors";
import { requireUser } from "@/lib/auth/session";
import { capabilities, requireCapability } from "@/lib/rbac";
import { flagSchema } from "@/lib/validation/flag";
import type { ActionState } from "@/lib/actions/types";

export async function flagReportAction(
  priceReportId: string,
  redirectPath: string,
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser(redirectPath);
  requireCapability(capabilities.canConfirmOrFlag(user), "You must be signed in to flag a price.");

  const parsed = flagSchema.safeParse({
    reason: formData.get("reason"),
    comment: formData.get("comment") || undefined,
  });
  if (!parsed.success) {
    return { error: "Please choose a reason for flagging this price." };
  }

  try {
    await prisma.flag.create({
      data: {
        priceReportId,
        userId: user.id,
        reason: parsed.data.reason,
        comment: parsed.data.comment || null,
      },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "You've already flagged this price." };
    }
    throw error;
  }

  revalidatePath(redirectPath);
  return { success: true };
}

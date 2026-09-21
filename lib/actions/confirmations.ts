"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/client";
import { isUniqueConstraintError } from "@/lib/db/errors";
import { requireUser } from "@/lib/auth/session";
import { capabilities, requireCapability } from "@/lib/rbac";
import type { ActionState } from "@/lib/actions/types";

export async function confirmReportAction(
  priceReportId: string,
  redirectPath: string,
  _prevState: ActionState,
  _formData: FormData,
): Promise<ActionState> {
  const user = await requireUser(redirectPath);
  requireCapability(capabilities.canConfirmOrFlag(user), "You must be signed in to confirm a price.");

  try {
    await prisma.priceConfirmation.create({
      data: { priceReportId, userId: user.id },
    });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return { error: "You've already confirmed this price." };
    }
    throw error;
  }

  revalidatePath(redirectPath);
  return { success: true };
}

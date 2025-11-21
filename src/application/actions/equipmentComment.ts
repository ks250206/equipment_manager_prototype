"use server";

import { drizzleEquipmentCommentRepository as equipmentCommentRepository } from "@/infrastructure/repositories/DrizzleEquipmentCommentRepository";
import { createEquipmentComment } from "@/domain/models/EquipmentComment/EquipmentComment";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function getEquipmentCommentsAction(equipmentId: string) {
  const result =
    await equipmentCommentRepository.findByEquipmentId(equipmentId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function createEquipmentCommentAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const equipmentId = formData.get("equipmentId") as string;
  const content = formData.get("content") as string;

  const id = crypto.randomUUID();
  const createdAt = new Date();

  const commentResult = createEquipmentComment(
    id,
    equipmentId,
    session.user.id,
    content,
    createdAt,
  );

  if (commentResult.isErr()) {
    return { error: commentResult.error.message };
  }

  const saveResult = await equipmentCommentRepository.save(commentResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath(`/equipment/${equipmentId}`);
  return { success: true };
}

export async function deleteEquipmentCommentAction(
  id: string,
  equipmentId: string,
  commentUserId: string,
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  // Only the comment author or admin can delete
  if (session.user.id !== commentUserId && session.user.role !== "ADMIN") {
    return { error: "You can only delete your own comments" };
  }

  try {
    const deleteResult = await equipmentCommentRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath(`/equipment/${equipmentId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

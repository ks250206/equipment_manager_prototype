"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { PermissionService } from "@/domain/services/PermissionService";
import { DrizzleEquipmentCategoryRepository } from "@/infrastructure/repositories/DrizzleEquipmentCategoryRepository";
import { createEquipmentCategory } from "@/domain/models/Equipment/EquipmentCategory";
import { revalidatePath } from "next/cache";

type ActionState = {
  error?: string;
  success?: boolean;
};

const equipmentCategoryRepository = new DrizzleEquipmentCategoryRepository();
const userRepository = new DrizzleUserRepository();

async function checkEquipmentPermission() {
  const session = await auth();
  if (!session?.user?.email) {
    return { allowed: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr() || !userResult.value) {
    return { allowed: false, error: "User not found" };
  }

  if (!PermissionService.canManageEquipment(userResult.value)) {
    return { allowed: false, error: "Forbidden: Insufficient permissions" };
  }

  return { allowed: true };
}

export async function getEquipmentCategories() {
  const result = await equipmentCategoryRepository.findAll();
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function createEquipmentCategoryAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkEquipmentPermission();
  if (!perm.allowed) return { error: perm.error };

  const categoryMajor = formData.get("categoryMajor") as string;
  const categoryMinor = formData.get("categoryMinor") as string;

  const id = crypto.randomUUID();
  const categoryResult = createEquipmentCategory(
    id,
    categoryMajor,
    categoryMinor,
  );

  if (categoryResult.isErr()) {
    return { error: categoryResult.error.message };
  }

  const saveResult = await equipmentCategoryRepository.save(
    categoryResult.value,
  );
  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/equipments");
  return { success: true };
}

export async function deleteEquipmentCategoryAction(id: string) {
  try {
    const perm = await checkEquipmentPermission();
    if (!perm.allowed) return { error: perm.error };

    const deleteResult = await equipmentCategoryRepository.delete(id);
    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }
    revalidatePath("/equipments");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

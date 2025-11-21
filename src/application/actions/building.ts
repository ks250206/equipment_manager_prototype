"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { PermissionService } from "@/domain/services/PermissionService";
import { DrizzleBuildingRepository } from "@/infrastructure/repositories/DrizzleBuildingRepository";
import { createBuilding } from "@/domain/models/Building/Building";
import { revalidatePath } from "next/cache";

type ActionState = {
  error?: string;
  success?: boolean;
};

const buildingRepository = new DrizzleBuildingRepository();
const userRepository = new DrizzleUserRepository();

async function checkBuildingPermission() {
  const session = await auth();
  if (!session?.user?.email) {
    return { allowed: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr() || !userResult.value) {
    return { allowed: false, error: "User not found" };
  }

  if (!PermissionService.canManageBuildings(userResult.value)) {
    return { allowed: false, error: "Forbidden: Insufficient permissions" };
  }

  return { allowed: true };
}

export async function getAllBuildingsAction() {
  const result = await buildingRepository.findAll();
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getBuildingByIdAction(id: string) {
  const result = await buildingRepository.findById(id);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function createBuildingAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkBuildingPermission();
  if (!perm.allowed) return { error: perm.error };

  const name = formData.get("name") as string;
  const address = formData.get("address") as string;

  const id = crypto.randomUUID();

  const buildingResult = createBuilding(id, name, address || null);

  if (buildingResult.isErr()) {
    return { error: buildingResult.error.message };
  }

  const saveResult = await buildingRepository.save(buildingResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/buildings");
  return { success: true };
}

export async function updateBuildingAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkBuildingPermission();
  if (!perm.allowed) return { error: perm.error };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const address = formData.get("address") as string;

  const buildingResult = createBuilding(id, name, address || null);

  if (buildingResult.isErr()) {
    return { error: buildingResult.error.message };
  }

  const saveResult = await buildingRepository.save(buildingResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/buildings");
  return { success: true };
}

export async function deleteBuildingAction(id: string) {
  try {
    const perm = await checkBuildingPermission();
    if (!perm.allowed) return { error: perm.error };

    const deleteResult = await buildingRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath("/buildings");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

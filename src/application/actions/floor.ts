"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { PermissionService } from "@/domain/services/PermissionService";
import { DrizzleFloorRepository } from "@/infrastructure/repositories/DrizzleFloorRepository";
import { createFloor } from "@/domain/models/Floor/Floor";
import { revalidatePath } from "next/cache";

const floorRepository = new DrizzleFloorRepository();
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

export async function getAllFloorsAction() {
  const result = await floorRepository.findAll();
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getFloorByIdAction(id: string) {
  const result = await floorRepository.findById(id);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getFloorsByBuildingIdAction(buildingId: string) {
  const result = await floorRepository.findByBuildingId(buildingId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createFloorAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkBuildingPermission();
  if (!perm.allowed) return { error: perm.error };

  const name = formData.get("name") as string;
  const buildingId = formData.get("buildingId") as string;
  const floorNumberStr = formData.get("floorNumber") as string;
  const floorNumber = floorNumberStr ? parseInt(floorNumberStr, 10) : null;

  const id = crypto.randomUUID();

  const floorResult = createFloor(id, name, buildingId, floorNumber);

  if (floorResult.isErr()) {
    return { error: floorResult.error.message };
  }

  const saveResult = await floorRepository.save(floorResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/buildings");
  return { success: true };
}

export async function updateFloorAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkBuildingPermission();
  if (!perm.allowed) return { error: perm.error };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const buildingId = formData.get("buildingId") as string;
  const floorNumberStr = formData.get("floorNumber") as string;
  const floorNumber = floorNumberStr ? parseInt(floorNumberStr, 10) : null;

  const floorResult = createFloor(id, name, buildingId, floorNumber);

  if (floorResult.isErr()) {
    return { error: floorResult.error.message };
  }

  const saveResult = await floorRepository.save(floorResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/buildings");
  return { success: true };
}

export async function deleteFloorAction(id: string) {
  try {
    const perm = await checkBuildingPermission();
    if (!perm.allowed) return { error: perm.error };

    const deleteResult = await floorRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath("/buildings");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

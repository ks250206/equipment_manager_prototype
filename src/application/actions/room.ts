"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { PermissionService } from "@/domain/services/PermissionService";
import { DrizzleRoomRepository } from "@/infrastructure/repositories/DrizzleRoomRepository";
import { createRoom } from "@/domain/models/Room/Room";
import { revalidatePath } from "next/cache";

const roomRepository = new DrizzleRoomRepository();
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

export async function getAllRoomsAction() {
  const result = await roomRepository.findAll();
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getRoomByIdAction(id: string) {
  const result = await roomRepository.findById(id);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getRoomsByFloorIdAction(floorId: string) {
  const result = await roomRepository.findByFloorId(floorId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function createRoomAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkBuildingPermission();
  if (!perm.allowed) return { error: perm.error };

  const name = formData.get("name") as string;
  const floorId = formData.get("floorId") as string;
  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? parseInt(capacityStr, 10) : null;

  const id = crypto.randomUUID();

  const roomResult = createRoom(id, name, floorId, capacity);

  if (roomResult.isErr()) {
    return { error: roomResult.error.message };
  }

  const saveResult = await roomRepository.save(roomResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/buildings");
  return { success: true };
}

export async function updateRoomAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkBuildingPermission();
  if (!perm.allowed) return { error: perm.error };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const floorId = formData.get("floorId") as string;
  const capacityStr = formData.get("capacity") as string;
  const capacity = capacityStr ? parseInt(capacityStr, 10) : null;

  const roomResult = createRoom(id, name, floorId, capacity);

  if (roomResult.isErr()) {
    return { error: roomResult.error.message };
  }

  const saveResult = await roomRepository.save(roomResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/buildings");
  return { success: true };
}

export async function deleteRoomAction(id: string) {
  try {
    const perm = await checkBuildingPermission();
    if (!perm.allowed) return { error: perm.error };

    const deleteResult = await roomRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath("/buildings");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

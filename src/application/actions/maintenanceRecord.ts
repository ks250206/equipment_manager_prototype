"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { PermissionService } from "@/domain/services/PermissionService";
import { drizzleMaintenanceRecordRepository as maintenanceRecordRepository } from "@/infrastructure/repositories/DrizzleMaintenanceRecordRepository";
import { drizzleEquipmentRepository as equipmentRepository } from "@/infrastructure/repositories/DrizzleEquipmentRepository";
import { createMaintenanceRecord } from "@/domain/models/MaintenanceRecord/MaintenanceRecord";
import { revalidatePath } from "next/cache";

type ActionState = {
  error?: string;
  success?: boolean;
};

const userRepository = new DrizzleUserRepository();

async function checkMaintenancePermission(equipmentId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { allowed: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr() || !userResult.value) {
    return { allowed: false, error: "User not found" };
  }

  const user = userResult.value;

  // Get equipment to check administrator and vice-administrator permissions
  const equipmentResult = await equipmentRepository.findById(equipmentId);
  if (equipmentResult.isErr() || !equipmentResult.value) {
    return { allowed: false, error: "Equipment not found" };
  }

  const equipment = equipmentResult.value;

  // Check if user can edit equipment management (administrator and vice-administrators)
  if (!PermissionService.canEditEquipmentManagement(user, equipment)) {
    return { allowed: false, error: "Forbidden: Insufficient permissions" };
  }

  return { allowed: true, user };
}

export async function getMaintenanceRecordsByEquipmentIdAction(
  equipmentId: string,
) {
  const result =
    await maintenanceRecordRepository.findByEquipmentId(equipmentId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function createMaintenanceRecordAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const equipmentId = formData.get("equipmentId") as string;

  const perm = await checkMaintenancePermission(equipmentId);
  if (!perm.allowed || !perm.user) return { error: perm.error };

  const recordDate = formData.get("recordDate") as string;
  const description = formData.get("description") as string;
  const cost = formData.get("cost") as string;

  const id = crypto.randomUUID();

  const recordResult = createMaintenanceRecord(
    id,
    equipmentId,
    new Date(recordDate),
    description,
    perm.user.id,
    cost ? parseInt(cost, 10) : null,
  );

  if (recordResult.isErr()) {
    return { error: recordResult.error.message };
  }

  const saveResult = await maintenanceRecordRepository.save(recordResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath(`/equipments/${equipmentId}`);
  return { success: true };
}

export async function updateMaintenanceRecordAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const equipmentId = formData.get("equipmentId") as string;

  const perm = await checkMaintenancePermission(equipmentId);
  if (!perm.allowed) return { error: perm.error };

  const id = formData.get("id") as string;
  const recordDate = formData.get("recordDate") as string;
  const description = formData.get("description") as string;
  const cost = formData.get("cost") as string;
  const performedBy = formData.get("performedBy") as string;

  const recordResult = createMaintenanceRecord(
    id,
    equipmentId,
    new Date(recordDate),
    description,
    performedBy,
    cost ? parseInt(cost, 10) : null,
  );

  if (recordResult.isErr()) {
    return { error: recordResult.error.message };
  }

  const saveResult = await maintenanceRecordRepository.save(recordResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath(`/equipments/${equipmentId}`);
  return { success: true };
}

export async function deleteMaintenanceRecordAction(
  id: string,
  equipmentId: string,
) {
  const perm = await checkMaintenancePermission(equipmentId);
  if (!perm.allowed) return { error: perm.error };

  try {
    const deleteResult = await maintenanceRecordRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath(`/equipments/${equipmentId}`);
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

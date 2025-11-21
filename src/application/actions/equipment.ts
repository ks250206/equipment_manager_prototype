"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { PermissionService } from "@/domain/services/PermissionService";
import { drizzleEquipmentRepository as equipmentRepository } from "@/infrastructure/repositories/DrizzleEquipmentRepository";
import {
  createEquipment,
  EquipmentRunningState,
} from "@/domain/models/Equipment/Equipment";
import { revalidatePath } from "next/cache";

type ActionState = {
  error?: string;
  success?: boolean;
};

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

export async function getEquipments() {
  const result = await equipmentRepository.findAll();
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getEquipmentByIdAction(id: string) {
  const result = await equipmentRepository.findById(id);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function getEquipmentByRoomIdAction(roomId: string) {
  const result = await equipmentRepository.findByRoomId(roomId);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

export async function createEquipmentAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkEquipmentPermission();
  if (!perm.allowed) return { error: perm.error };

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryMajor = formData.get("categoryMajor") as string;
  const categoryMinor = formData.get("categoryMinor") as string;
  const roomId = formData.get("roomId") as string;
  const runningState = formData.get("runningState") as string;
  const installationDate = formData.get("installationDate") as string;
  const administratorId = formData.get("administratorId") as string;

  const id = crypto.randomUUID();

  const equipmentResult = createEquipment(
    id,
    name,
    description,
    categoryMajor || null,
    categoryMinor || null,
    roomId || null,
    (runningState as EquipmentRunningState) || "OPERATIONAL",
    installationDate ? new Date(installationDate) : null,
    administratorId || null,
    [],
  );

  if (equipmentResult.isErr()) {
    return { error: equipmentResult.error.message };
  }

  const saveResult = await equipmentRepository.save(equipmentResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/reservations");
  revalidatePath("/equipments");
  return { success: true };
}

export async function updateEquipmentAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const perm = await checkEquipmentPermission();
  if (!perm.allowed) return { error: perm.error };

  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const categoryMajor = formData.get("categoryMajor") as string;
  const categoryMinor = formData.get("categoryMinor") as string;
  const roomId = formData.get("roomId") as string;
  const runningState = formData.get("runningState") as string;
  const installationDate = formData.get("installationDate") as string;
  const administratorId = formData.get("administratorId") as string;

  // Get existing equipment to preserve viceAdministratorIds if not provided
  const existingResult = await equipmentRepository.findById(id);
  const existingEquipment =
    existingResult.isOk() && existingResult.value ? existingResult.value : null;

  const equipmentResult = createEquipment(
    id,
    name,
    description,
    categoryMajor || null,
    categoryMinor || null,
    roomId || null,
    (runningState as EquipmentRunningState) || "OPERATIONAL",
    installationDate ? new Date(installationDate) : null,
    administratorId || null,
    existingEquipment?.viceAdministratorIds || [],
  );

  if (equipmentResult.isErr()) {
    return { error: equipmentResult.error.message };
  }

  const saveResult = await equipmentRepository.save(equipmentResult.value);

  if (saveResult.isErr()) {
    return { error: saveResult.error.message };
  }

  revalidatePath("/reservations");
  revalidatePath("/equipments");
  revalidatePath(`/equipments/${id}`);
  return { success: true };
}

export async function updateEquipmentManagementAction(
  id: string,
  data: {
    administratorId: string | null;
    viceAdministratorIds: string[];
  },
) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr() || !userResult.value) {
    return { success: false, error: "User not found" };
  }
  const currentUser = userResult.value;

  const equipmentResult = await equipmentRepository.findById(id);
  if (equipmentResult.isErr() || !equipmentResult.value) {
    return { success: false, error: "Equipment not found" };
  }
  const equipment = equipmentResult.value;

  // Check if user has permission to edit equipment management
  if (!PermissionService.canEditEquipmentManagement(currentUser, equipment)) {
    return { success: false, error: "Forbidden: Insufficient permissions" };
  }

  // Create updated equipment object
  // We need to use the factory to ensure validity, but we want to keep existing values
  // The factory requires all values.

  const updatedEquipmentResult = createEquipment(
    equipment.id,
    equipment.name,
    equipment.description,
    equipment.categoryMajor,
    equipment.categoryMinor,
    equipment.roomId,
    equipment.runningState,
    equipment.installationDate,
    data.administratorId,
    data.viceAdministratorIds,
    equipment.administrator, // These are for display, repository will ignore or re-fetch
    undefined, // viceAdministrators for display
    equipment.location,
  );

  if (updatedEquipmentResult.isErr()) {
    return { success: false, error: updatedEquipmentResult.error.message };
  }

  const saveResult = await equipmentRepository.save(
    updatedEquipmentResult.value,
  );

  if (saveResult.isErr()) {
    return { success: false, error: saveResult.error.message };
  }

  revalidatePath("/reservations");
  revalidatePath("/equipments");
  revalidatePath(`/equipments/${id}`);
  return { success: true };
}

export async function deleteEquipmentAction(id: string) {
  try {
    const perm = await checkEquipmentPermission();
    if (!perm.allowed) return { error: perm.error };

    const deleteResult = await equipmentRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath("/reservations");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

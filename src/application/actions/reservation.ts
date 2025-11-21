"use server";

import { DrizzleReservationRepository } from "@/infrastructure/repositories/DrizzleReservationRepository";
import { createReservation } from "@/domain/models/Reservation/Reservation";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

type ActionState = {
  error?: string;
  success?: boolean;
};

const reservationRepository = new DrizzleReservationRepository();

const CreateReservationSchema = z.object({
  equipmentId: z.string().uuid(),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  comment: z.string().optional(),
});

export async function getReservations() {
  const result = await reservationRepository.findAll();
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

import { fromZonedTime } from "date-fns-tz";
import { getTimezoneAction } from "./settings";

// ... (imports)

export async function createReservationAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  // In a real app, we would fetch the user ID from the DB based on the email
  // For now, let's assume we have a way to get the user ID or use a placeholder if not available in session
  // Since our session strategy is JWT, we might need to customize the session callback to include ID.
  // For this prototype, I'll fetch the user from DB using email.
  const { db } = await import("@/infrastructure/database/drizzle");
  const { users } = await import("@/infrastructure/database/schema");
  const { eq } = await import("drizzle-orm");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!user) {
    return { success: false, error: "User not found" };
  }

  const rawData = {
    equipmentId: formData.get("equipmentId"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    comment: formData.get("comment"),
  };

  const validatedFields = CreateReservationSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  const { equipmentId, startTime, endTime, comment } = validatedFields.data;

  // Get system timezone to interpret the input time correctly
  const timezone = await getTimezoneAction();

  // Parse the input string (e.g. "2025-11-21T05:00") as being in the system timezone
  // and convert it to UTC Date object
  const start = fromZonedTime(startTime, timezone);
  const end = fromZonedTime(endTime, timezone);

  // Check for overlaps
  const overlapsResult =
    await reservationRepository.findByEquipmentAndDateRange(
      equipmentId,
      start,
      end,
    );

  if (overlapsResult.isErr()) {
    return { success: false, error: overlapsResult.error.message };
  }

  if (overlapsResult.value.length > 0) {
    return { success: false, error: "Time slot already reserved" };
  }

  const id = crypto.randomUUID();
  const reservationResult = createReservation(
    id,
    start,
    end,
    user.id,
    equipmentId,
    comment || null,
  );

  if (reservationResult.isErr()) {
    return { success: false, error: reservationResult.error.message };
  }

  const saveResult = await reservationRepository.save(reservationResult.value);

  if (saveResult.isErr()) {
    return { success: false, error: saveResult.error.message };
  }

  revalidatePath("/reservations");
  return { success: true };
}

export async function updateReservationAction(
  prevState: ActionState | null,
  formData: FormData,
): Promise<ActionState> {
  const id = formData.get("id") as string;

  const perm = await checkReservationPermission(id);
  if (!perm.allowed || !perm.user) return { success: false, error: perm.error };

  const startTime = formData.get("startTime") as string;
  const endTime = formData.get("endTime") as string;
  const comment = formData.get("comment") as string;
  const equipmentId = formData.get("equipmentId") as string;

  // Get system timezone
  const timezone = await getTimezoneAction();

  const start = fromZonedTime(startTime, timezone);
  const end = fromZonedTime(endTime, timezone);

  const originalResult = await reservationRepository.findById(id);
  if (originalResult.isErr() || !originalResult.value) {
    return { success: false, error: "Reservation not found" };
  }
  const originalReservation = originalResult.value;

  // Check for overlaps (excluding the current reservation)
  const overlapsResult =
    await reservationRepository.findByEquipmentAndDateRange(
      equipmentId,
      start,
      end,
    );

  if (overlapsResult.isErr()) {
    return { success: false, error: overlapsResult.error.message };
  }

  // Filter out the current reservation from overlaps
  const otherOverlaps = overlapsResult.value.filter((r) => r.id !== id);
  if (otherOverlaps.length > 0) {
    return { success: false, error: "Time slot already reserved" };
  }

  const reservationResult = createReservation(
    id,
    start,
    end,
    originalReservation.userId,
    equipmentId,
    comment || null,
  );

  if (reservationResult.isErr()) {
    return { success: false, error: reservationResult.error.message };
  }

  const saveResult = await reservationRepository.save(reservationResult.value);

  if (saveResult.isErr()) {
    return { success: false, error: saveResult.error.message };
  }

  revalidatePath("/reservations");
  return { success: true };
}

export async function deleteReservationAction(id: string) {
  try {
    const perm = await checkReservationPermission(id);
    if (!perm.allowed) return { error: perm.error };

    const deleteResult = await reservationRepository.delete(id);

    if (deleteResult.isErr()) {
      return { error: deleteResult.error.message };
    }

    revalidatePath("/reservations");
    return { success: true };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}

export async function getReservationById(id: string) {
  const result = await reservationRepository.findById(id);
  if (result.isErr()) {
    throw new Error(result.error.message);
  }
  return result.value;
}

async function checkReservationPermission(reservationId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { allowed: false, error: "Unauthorized" };
  }

  const { db } = await import("@/infrastructure/database/drizzle");
  const { users } = await import("@/infrastructure/database/schema");
  const { eq } = await import("drizzle-orm");

  const user = await db.query.users.findFirst({
    where: eq(users.email, session.user.email),
  });

  if (!user) {
    return { allowed: false, error: "User not found" };
  }

  const reservationResult = await reservationRepository.findById(reservationId);
  if (reservationResult.isErr() || !reservationResult.value) {
    return { allowed: false, error: "Reservation not found" };
  }
  const reservation = reservationResult.value;

  // Allow if user is the owner
  if (reservation.userId === user.id) {
    return { allowed: true, user };
  }

  // Allow if user is admin or editor (assuming role based access)
  // For now, let's just check role if it exists on user
  if (user.role === "admin" || user.role === "editor") {
    return { allowed: true, user };
  }

  return { allowed: false, error: "Forbidden" };
}

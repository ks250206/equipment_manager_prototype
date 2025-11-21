"use server";

import { auth } from "@/auth";
import { DrizzleSystemSettingsRepository } from "@/infrastructure/repositories/DrizzleSystemSettingsRepository";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import {
  createSystemSetting,
  TIMEZONE_KEY,
  DEFAULT_TIMEZONE,
} from "@/domain/models/SystemSettings/SystemSettings";
import { revalidatePath } from "next/cache";

const settingsRepository = new DrizzleSystemSettingsRepository();
const userRepository = new DrizzleUserRepository();

export async function getTimezoneAction() {
  const result = await settingsRepository.findByKey(TIMEZONE_KEY);

  if (result.isErr()) {
    console.error("Failed to fetch timezone:", result.error);
    return DEFAULT_TIMEZONE;
  }

  return result.value?.value || DEFAULT_TIMEZONE;
}

export async function updateTimezoneAction(timezone: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr() || !userResult.value) {
    return { success: false, error: "User not found" };
  }
  const currentUser = userResult.value;

  // Only ADMIN can update system settings
  if (currentUser.role !== "ADMIN") {
    return { success: false, error: "Forbidden: Admin access required" };
  }

  const id = crypto.randomUUID();
  const settingResult = createSystemSetting(
    id,
    TIMEZONE_KEY,
    timezone,
    new Date(),
    currentUser.id,
  );

  if (settingResult.isErr()) {
    return { success: false, error: settingResult.error.message };
  }

  const saveResult = await settingsRepository.save(settingResult.value);

  if (saveResult.isErr()) {
    return { success: false, error: saveResult.error.message };
  }

  revalidatePath("/");
  return { success: true };
}

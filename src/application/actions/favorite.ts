"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { revalidatePath } from "next/cache";

const userRepository = new DrizzleUserRepository();

export async function toggleFavoriteAction(equipmentId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized" };
  }

  const userId = session.user.id;

  // Check current status
  const favoritesResult = await userRepository.getFavorites(userId);
  if (favoritesResult.isErr()) {
    return { success: false, error: "Failed to fetch favorites" };
  }

  const isFavorite = favoritesResult.value.includes(equipmentId);
  let result;

  if (isFavorite) {
    result = await userRepository.removeFavorite(userId, equipmentId);
  } else {
    result = await userRepository.addFavorite(userId, equipmentId);
  }

  if (result.isErr()) {
    return { success: false, error: result.error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/equipments/${equipmentId}`);
  revalidatePath("/equipments");

  return { success: true, isFavorite: !isFavorite };
}

export async function getFavoritesAction() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Unauthorized", data: [] };
  }

  const userId = session.user.id;
  const favoritesResult = await userRepository.getFavorites(userId);

  if (favoritesResult.isErr()) {
    return { success: false, error: "Failed to fetch favorites", data: [] };
  }

  return { success: true, data: favoritesResult.value };
}

"use server";

import { DrizzleBuildingRepository } from "@/infrastructure/repositories/DrizzleBuildingRepository";
import { drizzleEquipmentRepository } from "@/infrastructure/repositories/DrizzleEquipmentRepository";
import { DrizzleReservationRepository } from "@/infrastructure/repositories/DrizzleReservationRepository";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { auth } from "@/auth";
import type { Reservation } from "@/domain/models/Reservation/Reservation";
import type { Equipment } from "@/domain/models/Equipment/Equipment";

const buildingRepository = new DrizzleBuildingRepository();
const equipmentRepository = drizzleEquipmentRepository;
const reservationRepository = new DrizzleReservationRepository();

export async function getDashboardStatsAction() {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    // Fetch all data in parallel
    const [buildingsResult, equipmentResult, reservationsResult] =
      await Promise.all([
        buildingRepository.findAll(),
        equipmentRepository.findAll(),
        reservationRepository.findAll(),
      ]);

    // Handle errors
    if (buildingsResult.isErr()) {
      throw new Error(buildingsResult.error.message);
    }
    if (equipmentResult.isErr()) {
      throw new Error(equipmentResult.error.message);
    }
    if (reservationsResult.isErr()) {
      throw new Error(reservationsResult.error.message);
    }

    const buildings = buildingsResult.value;
    const equipment = equipmentResult.value;
    const allReservations = reservationsResult.value;

    // Filter active reservations (today and future)
    const now = new Date();
    const activeReservations = allReservations.filter(
      (reservation) => reservation.endTime >= now,
    );

    // Get recent reservations for current user (sorted by start time, limited to 10)
    const userReservations = userId
      ? allReservations.filter((reservation) => reservation.userId === userId)
      : [];
    const recentReservations = [...userReservations]
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, 10);

    // Fetch user specific data if logged in
    let favoriteEquipments: Equipment[] = [];
    let recentlyUsedEquipments: Equipment[] = [];

    if (userId) {
      const userRepository = new DrizzleUserRepository();
      const [favoritesResult, recentResult] = await Promise.all([
        userRepository.getFavorites(userId),
        reservationRepository.findRecentlyUsedEquipmentByUserId(userId, 5),
      ]);

      if (favoritesResult.isOk()) {
        const favoriteIds = favoritesResult.value;
        favoriteEquipments = equipment.filter((eq) =>
          favoriteIds.includes(eq.id),
        );
      }

      if (recentResult.isOk()) {
        const recentIds = recentResult.value;
        // Maintain order of recentIds
        recentlyUsedEquipments = recentIds
          .map((id) => equipment.find((eq) => eq.id === id))
          .filter((eq): eq is NonNullable<typeof eq> => !!eq);
      }
    }

    return {
      success: true,
      data: {
        buildingCount: buildings.length,
        equipmentCount: equipment.length,
        activeReservationCount: activeReservations.length,
        recentReservations: recentReservations.map(
          (reservation: Reservation) => ({
            id: reservation.id,
            startTime: reservation.startTime.toISOString(),
            endTime: reservation.endTime.toISOString(),
            comment: reservation.comment,
            booker: reservation.booker,
            equipment: reservation.equipment,
          }),
        ),
        favoriteEquipments,
        recentlyUsedEquipments,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

import ReservationsClientPage from "./ReservationsClientPage";
import { getEquipments } from "@/application/actions/equipment";
import { getReservations } from "@/application/actions/reservation";
import { getAllBuildingsAction } from "@/application/actions/building";
import { getAllFloorsAction } from "@/application/actions/floor";
import { getAllRoomsAction } from "@/application/actions/room";
import { getEquipmentCategories } from "@/application/actions/equipmentCategory";
import { getCurrentUserAction } from "@/application/actions/user";
import { getTimezoneAction } from "@/application/actions/settings";
import { getFavoritesAction } from "@/application/actions/favorite";

export default async function ReservationsPage() {
  const [
    equipments,
    reservations,
    buildings,
    floors,
    rooms,
    categories,
    timezone,
    currentUserResult,
    favoritesResult,
  ] = await Promise.all([
    getEquipments(),
    getReservations(),
    getAllBuildingsAction(),
    getAllFloorsAction(),
    getAllRoomsAction(),
    getEquipmentCategories(),
    getTimezoneAction(),
    getCurrentUserAction(),
    getFavoritesAction(),
  ]);

  const currentUser = currentUserResult.success ? (currentUserResult.data ?? null) : null;
  const favoriteEquipmentIds = favoritesResult.success
    ? favoritesResult.data
    : [];

  return (
    <ReservationsClientPage
      initialEquipments={equipments}
      reservations={reservations}
      buildings={buildings}
      floors={floors}
      rooms={rooms}
      categories={categories}
      timezone={timezone}
      currentUser={currentUser}
      favoriteEquipmentIds={favoriteEquipmentIds}
    />
  );
}

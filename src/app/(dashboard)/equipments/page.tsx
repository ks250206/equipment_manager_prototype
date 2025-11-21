import EquipmentsClientPage from "./EquipmentsClientPage";
import { getEquipments } from "@/application/actions/equipment";
import { getAllRoomsAction } from "@/application/actions/room";
import { getAllFloorsAction } from "@/application/actions/floor";
import { getAllBuildingsAction } from "@/application/actions/building";
import { getEquipmentCategories } from "@/application/actions/equipmentCategory";
import { getFavoritesAction } from "@/application/actions/favorite";
import { auth } from "@/auth";

export default async function EquipmentPage() {
  const [equipments, rooms, floors, buildings, categories, favoritesResult] =
    await Promise.all([
      getEquipments(),
      getAllRoomsAction(),
      getAllFloorsAction(),
      getAllBuildingsAction(),
      getEquipmentCategories(),
      getFavoritesAction(),
    ]);

  const session = await auth();
  const userRole = session?.user?.role;
  const favoriteEquipmentIds = favoritesResult.success
    ? favoritesResult.data
    : [];

  return (
    <EquipmentsClientPage
      initialEquipments={equipments}
      buildings={buildings}
      floors={floors}
      rooms={rooms}
      categories={categories}
      favoriteEquipmentIds={favoriteEquipmentIds}
      userRole={userRole}
    />
  );
}

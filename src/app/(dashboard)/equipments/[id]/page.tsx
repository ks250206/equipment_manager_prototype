import { getEquipmentByIdAction } from "@/application/actions/equipment";
import { getReservations } from "@/application/actions/reservation";
import { getMaintenanceRecordsByEquipmentIdAction } from "@/application/actions/maintenanceRecord";
import { getEquipmentCommentsAction } from "@/application/actions/equipmentComment";
import {
  getUsersAction,
  getCurrentUserAction,
} from "@/application/actions/user";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EquipmentDetail } from "@/components/equipment/EquipmentDetail";
import { MaintenanceRecordList } from "@/components/equipment/MaintenanceRecordList";
import { EquipmentCommentList } from "@/components/equipment/EquipmentCommentList";
import { ReservationList } from "@/components/equipment/ReservationList";

export default async function EquipmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const equipment = await getEquipmentByIdAction(id);

  if (!equipment) {
    notFound();
  }

  // Fetch related data
  const [
    allReservations,
    maintenanceRecords,
    comments,
    users,
    currentUserResult,
  ] = await Promise.all([
    getReservations(),
    getMaintenanceRecordsByEquipmentIdAction(id),
    getEquipmentCommentsAction(id),
    getUsersAction(),
    getCurrentUserAction(),
  ]);

  const currentUser =
    currentUserResult.success && currentUserResult.data
      ? {
          id: currentUserResult.data.id,
          email: currentUserResult.data.email,
          name: currentUserResult.data.name,
          role: currentUserResult.data.role,
        }
      : null;

  let isFavorite = false;
  if (currentUser) {
    const userRepository = new DrizzleUserRepository();
    const favoritesResult = await userRepository.getFavorites(currentUser.id);
    if (favoritesResult.isOk()) {
      isFavorite = favoritesResult.value.includes(id);
    }
  }

  // Filter reservations for this equipment
  const equipmentReservations = allReservations.filter(
    (r: { equipmentId: string }) => r.equipmentId === id,
  );

  const breadcrumbItems = [
    { label: "Equipments", href: "/equipments" },
    { label: equipment.name, href: `/equipments/${id}` },
  ];

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Breadcrumbs items={breadcrumbItems} />

      <h1 className="text-3xl font-bold">{equipment.name}</h1>

      {/* Equipment Details */}
      <EquipmentDetail
        equipment={equipment}
        users={users}
        currentUser={currentUser}
        isFavorite={isFavorite}
      />

      {/* Reservations */}
      <ReservationList reservations={equipmentReservations} />

      {/* Maintenance Records */}
      <MaintenanceRecordList
        maintenanceRecords={maintenanceRecords}
        equipmentId={id}
        equipment={equipment}
        currentUser={currentUser}
      />

      {/* Comments */}
      <EquipmentCommentList comments={comments} equipmentId={id} />
    </div>
  );
}

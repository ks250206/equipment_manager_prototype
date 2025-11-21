import { getDashboardStatsAction } from "@/application/actions/dashboard";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import DashboardClientPage from "./DashboardClientPage";

export default async function DashboardPage() {
  const session = await auth();

  // Redirect to login if not authenticated
  if (!session?.user) {
    redirect("/login");
  }

  const statsResponse = await getDashboardStatsAction();

  if (!statsResponse.success || !statsResponse.data) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">Failed to load dashboard data</p>
      </div>
    );
  }

  const {
    buildingCount,
    equipmentCount,
    activeReservationCount,
    recentReservations,
    favoriteEquipments,
    recentlyUsedEquipments,
  } = statsResponse.data;

  return (
    <DashboardClientPage
      buildingCount={buildingCount}
      equipmentCount={equipmentCount}
      activeReservationCount={activeReservationCount}
      recentReservations={recentReservations}
      favoriteEquipments={favoriteEquipments}
      recentlyUsedEquipments={recentlyUsedEquipments}
      mustChangePassword={session.user.mustChangePassword || false}
    />
  );
}

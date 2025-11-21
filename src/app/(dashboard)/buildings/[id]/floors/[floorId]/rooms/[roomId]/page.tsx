import { getBuildingByIdAction } from "@/application/actions/building";
import { getFloorByIdAction } from "@/application/actions/floor";
import { getRoomByIdAction } from "@/application/actions/room";
import { getEquipmentByRoomIdAction } from "@/application/actions/equipment";
import { getCurrentUserAction } from "@/application/actions/user";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FavoriteButton } from "@/components/equipment/FavoriteButton";

type Props = {
  params: Promise<{ id: string; floorId: string; roomId: string }>;
};

export default async function RoomDetailsPage({ params }: Props) {
  const { id, floorId, roomId } = await params;
  const building = await getBuildingByIdAction(id);
  const floor = await getFloorByIdAction(floorId);
  const room = await getRoomByIdAction(roomId);

  if (!building || !floor || !room) {
    notFound();
  }

  const equipments = await getEquipmentByRoomIdAction(roomId);

  // Get favorites for current user
  const currentUserResult = await getCurrentUserAction();
  const currentUser =
    currentUserResult.success && currentUserResult.data
      ? {
          id: currentUserResult.data.id,
          email: currentUserResult.data.email,
          name: currentUserResult.data.name,
          role: currentUserResult.data.role,
        }
      : null;

  let favoriteEquipmentIds: string[] = [];
  if (currentUser) {
    const userRepository = new DrizzleUserRepository();
    const favoritesResult = await userRepository.getFavorites(currentUser.id);
    if (favoritesResult.isOk()) {
      favoriteEquipmentIds = favoritesResult.value;
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Buildings", href: "/buildings" },
          { label: building.name, href: `/buildings/${building.id}` },
          {
            label: floor.name,
            href: `/buildings/${building.id}/floors/${floor.id}`,
          },
          { label: room.name },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">{room.name}</h1>
        <p className="text-gray-500">
          Building: {building.name} | Floor: {floor.name} | Capacity:{" "}
          {room.capacity ?? "-"}
        </p>
      </div>

      <div className="border-t pt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Equipment in this Room</h2>
          {/* Future: Add Equipment Button here that pre-selects this room */}
        </div>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Description</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((equipment) => {
                const isFavorite = favoriteEquipmentIds.includes(equipment.id);
                return (
                  <tr key={equipment.id} className="border-t">
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/equipments/${equipment.id}`}
                          className="text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          {equipment.name}
                        </Link>
                        <FavoriteButton
                          equipmentId={equipment.id}
                          initialIsFavorite={isFavorite}
                          noBorder
                        />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      {equipment.description || "-"}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Button variant="outline" size="sm" asChild>
                        <Link href={`/equipments/${equipment.id}`}>
                          Details
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {equipments.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    No equipment found in this room.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

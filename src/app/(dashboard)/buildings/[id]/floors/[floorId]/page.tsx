import { getBuildingByIdAction } from "@/application/actions/building";
import { getFloorByIdAction } from "@/application/actions/floor";
import { getRoomsByFloorIdAction } from "@/application/actions/room";
import RoomManager from "@/components/room/RoomManager";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ id: string; floorId: string }>;
};

export default async function FloorDetailsPage({ params }: Props) {
  const { id, floorId } = await params;
  const building = await getBuildingByIdAction(id);
  const floor = await getFloorByIdAction(floorId);

  if (!building || !floor) {
    notFound();
  }

  const rooms = await getRoomsByFloorIdAction(floorId);
  const session = await auth();
  const userRole = session?.user?.role;

  // We need to pass floors to RoomManager for the select dropdown,
  // but since we are in a specific floor context, we might only pass the current floor
  // or we might need to fetch all floors for this building if we want to allow moving rooms (though that's out of scope for now).
  // For now, let's just pass the current floor as a single-item array to satisfy the prop requirement,
  // and the RoomManager will use the selectedFloorId to pre-select it.
  const floorsForContext = [floor];

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Buildings", href: "/buildings" },
          { label: building.name, href: `/buildings/${building.id}` },
          { label: floor.name },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">{floor.name}</h1>
        <p className="text-gray-500">
          Building: {building.name} | Floor Number: {floor.floorNumber ?? "-"}
        </p>
      </div>

      <div className="border-t pt-8">
        <RoomManager
          rooms={rooms}
          floors={floorsForContext}
          selectedFloorId={floor.id}
          userRole={userRole}
        />
      </div>
    </div>
  );
}

import { getBuildingByIdAction } from "@/application/actions/building";
import { getFloorsByBuildingIdAction } from "@/application/actions/floor";
import FloorManager from "@/components/floor/FloorManager";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { notFound } from "next/navigation";
import { auth } from "@/auth";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function BuildingDetailsPage({ params }: Props) {
  const { id } = await params;
  const building = await getBuildingByIdAction(id);

  if (!building) {
    notFound();
  }

  const floors = await getFloorsByBuildingIdAction(id);
  const session = await auth();
  const userRole = session?.user?.role;

  return (
    <div className="container mx-auto py-10 space-y-8">
      <Breadcrumbs
        items={[
          { label: "Buildings", href: "/buildings" },
          { label: building.name },
        ]}
      />

      <div>
        <h1 className="text-3xl font-bold mb-2">{building.name}</h1>
        <p className="text-gray-500">
          {building.address || "No address provided"}
        </p>
      </div>

      <div className="border-t pt-8">
        <FloorManager
          floors={floors}
          buildings={[building]}
          selectedBuildingId={building.id}
          userRole={userRole}
        />
      </div>
    </div>
  );
}

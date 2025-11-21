import { getAllBuildingsAction } from "@/application/actions/building";
import BuildingManager from "@/components/building/BuildingManager";
import { auth } from "@/auth";

export default async function BuildingsPage() {
  const buildings = await getAllBuildingsAction();
  const session = await auth();
  const userRole = session?.user?.role;

  return (
    <main className="container mx-auto py-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Building Management</h1>
        <BuildingManager buildings={buildings} userRole={userRole} />
      </div>
    </main>
  );
}

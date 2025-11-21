import CategoryManager from "@/components/equipment/CategoryManager";
import { getEquipmentCategories } from "@/application/actions/equipmentCategory";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function CategoriesPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // Check if user is Editor or Admin
  if (userRole !== "ADMIN" && userRole !== "EDITOR") {
    redirect("/dashboard");
  }

  const categories = await getEquipmentCategories();

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Equipment Categories</h1>
        <CategoryManager categories={categories} userRole={userRole} />
      </div>
    </main>
  );
}

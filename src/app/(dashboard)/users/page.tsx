import UserManagement from "@/components/user/UserManagement";
import { getAllUsersAction } from "@/application/actions/user";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UsersPage() {
  const session = await auth();
  const userRole = session?.user?.role;

  // Check if user is Admin
  if (userRole !== "ADMIN") {
    redirect("/dashboard");
  }

  const usersResult = await getAllUsersAction();

  if (!usersResult.success || !usersResult.data) {
    return (
      <main className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold mb-4">User Management</h1>
          <p className="text-red-500">
            Failed to load users: {usersResult.error}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">User Management</h1>
        <UserManagement users={usersResult.data} />
      </div>
    </main>
  );
}

import { getCurrentUserAction } from "@/application/actions/user";
import { UserProfileManager } from "@/components/user/UserProfileManager";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const result = await getCurrentUserAction();

  if (!result.success || !result.data) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Profile Settings</h1>
      <UserProfileManager user={result.data} />
    </div>
  );
}

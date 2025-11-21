import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getTimezoneAction } from "@/application/actions/settings";
import SettingsManager from "@/components/settings/SettingsManager";

export default async function SettingsPage() {
  const session = await auth();

  // Check if user is admin
  if (session?.user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  const currentTimezone = await getTimezoneAction();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      <SettingsManager currentTimezone={currentTimezone} />
    </div>
  );
}

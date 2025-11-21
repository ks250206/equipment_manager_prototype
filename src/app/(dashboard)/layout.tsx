import { signOut, auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  // Note: Password change check is handled in auth.config.ts to avoid redirect loops

  return (
    <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
      <div className="w-full flex-none md:w-64 bg-gray-800 text-white p-4">
        <div className="flex h-full flex-col justify-between">
          <div>
            <h1 className="text-xl font-bold mb-4">Equipment Reservation</h1>

            {/* User Information Section */}
            <div className="mb-6 p-3 bg-gray-700 rounded-lg">
              <div className="flex items-center gap-3">
                {/* Avatar or Initials */}
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold flex-shrink-0">
                  {session.user.avatarUrl ? (
                    <Image
                      src={session.user.avatarUrl}
                      alt="User avatar"
                      width={40}
                      height={40}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>
                      {(
                        session.user.displayName ||
                        session.user.name ||
                        session.user.email ||
                        "U"
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  )}
                </div>

                {/* User Details */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {session.user.displayName ||
                      session.user.name ||
                      session.user.email}
                  </div>
                  <div className="text-xs text-gray-300 truncate">
                    {session.user.email}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    Role: {session.user.role}
                  </div>
                </div>
              </div>
            </div>

            <nav>
              <ul>
                <li className="mb-2">
                  <Link
                    href="/dashboard"
                    className="block p-2 hover:bg-gray-700 rounded"
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/reservations"
                    className="block p-2 hover:bg-gray-700 rounded"
                  >
                    Reservations
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/buildings"
                    className="block p-2 hover:bg-gray-700 rounded"
                  >
                    Buildings
                  </Link>
                </li>
                <li className="mb-2">
                  <Link
                    href="/equipments"
                    className="block p-2 hover:bg-gray-700 rounded"
                  >
                    Equipments
                  </Link>
                </li>
                {(session.user.role === "ADMIN" ||
                  session.user.role === "EDITOR") && (
                  <li className="mb-2">
                    <Link
                      href="/categories"
                      className="block p-2 hover:bg-gray-700 rounded"
                    >
                      Categories
                    </Link>
                  </li>
                )}
                <li className="mb-2">
                  <Link
                    href="/profile"
                    className="block p-2 hover:bg-gray-700 rounded"
                  >
                    Profile
                  </Link>
                </li>
                {session.user.role === "ADMIN" && (
                  <>
                    <li className="mb-2">
                      <Link
                        href="/users"
                        className="block p-2 hover:bg-gray-700 rounded"
                      >
                        Users
                      </Link>
                    </li>
                    <li className="mb-2">
                      <Link
                        href="/settings"
                        className="block p-2 hover:bg-gray-700 rounded"
                      >
                        Settings
                      </Link>
                    </li>
                  </>
                )}
              </ul>
            </nav>
          </div>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/" });
            }}
          >
            <Button variant="destructive" className="w-full">
              Sign Out
            </Button>
          </form>
        </div>
      </div>
      <div className="flex-grow p-6 md:overflow-y-auto md:p-12">
        {children}
        <Toaster />
      </div>
    </div>
  );
}

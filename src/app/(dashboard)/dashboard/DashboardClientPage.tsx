"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart, Clock, AlertTriangle } from "lucide-react";

type Equipment = {
  id: string;
  name: string;
  location?: {
    buildingName: string;
    floorName: string;
    roomName: string;
  };
};

type Reservation = {
  id: string;
  startTime: string;
  endTime: string;
  comment?: string | null;
  booker?: {
    name: string | null;
  } | null;
  equipment?: {
    name: string;
  } | null;
};

type Props = {
  buildingCount: number;
  equipmentCount: number;
  activeReservationCount: number;
  recentReservations: Reservation[];
  favoriteEquipments: Equipment[];
  recentlyUsedEquipments: Equipment[];
  mustChangePassword?: boolean;
};

export default function DashboardClientPage({
  buildingCount,
  equipmentCount,
  activeReservationCount,
  recentReservations,
  favoriteEquipments,
  recentlyUsedEquipments,
  mustChangePassword = false,
}: Props) {
  const [favoritePage, setFavoritePage] = useState<number>(1);
  const [recentlyUsedPage, setRecentlyUsedPage] = useState<number>(1);
  const [reservationsPage, setReservationsPage] = useState<number>(1);
  const itemsPerPage = 6; // Grid layoutなので6件ずつ表示

  // Pagination calculations for Favorite Equipment
  const favoriteTotalPages = Math.ceil(
    favoriteEquipments.length / itemsPerPage,
  );
  const favoriteStartIndex = (favoritePage - 1) * itemsPerPage;
  const favoriteEndIndex = favoriteStartIndex + itemsPerPage;
  const paginatedFavorites = favoriteEquipments.slice(
    favoriteStartIndex,
    favoriteEndIndex,
  );

  // Pagination calculations for Recently Used Equipment
  const recentlyUsedTotalPages = Math.ceil(
    recentlyUsedEquipments.length / itemsPerPage,
  );
  const recentlyUsedStartIndex = (recentlyUsedPage - 1) * itemsPerPage;
  const recentlyUsedEndIndex = recentlyUsedStartIndex + itemsPerPage;
  const paginatedRecentlyUsed = recentlyUsedEquipments.slice(
    recentlyUsedStartIndex,
    recentlyUsedEndIndex,
  );

  // Pagination calculations for Recent Reservations
  const reservationsItemsPerPage = 10;
  const reservationsTotalPages = Math.ceil(
    recentReservations.length / reservationsItemsPerPage,
  );
  const reservationsStartIndex =
    (reservationsPage - 1) * reservationsItemsPerPage;
  const reservationsEndIndex =
    reservationsStartIndex + reservationsItemsPerPage;
  const paginatedReservations = recentReservations.slice(
    reservationsStartIndex,
    reservationsEndIndex,
  );

  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-50 mb-2">
          Dashboard
        </h1>
        <p className="text-lg text-slate-600 dark:text-slate-400">
          Welcome to Equipment Reservation System
        </p>
      </div>

      {/* Information Window - Password Change Required */}
      {mustChangePassword && (
        <Card className="mb-8 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full">
                  <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Password Change Required
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-4">
                  For security reasons, you must change your password on your
                  first login. Please change your password.
                </p>
                <Link href="/dashboard/change-password">
                  <Button className="bg-amber-600 hover:bg-amber-700 text-white">
                    Change Password
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Buildings Card */}
        <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Buildings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-slate-900 dark:text-slate-50 mb-1">
              {buildingCount}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registered Buildings
            </p>
          </CardContent>
        </Card>

        {/* Equipment Card */}
        <Card className="border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-200 bg-white dark:bg-slate-800">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
              Equipments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{equipmentCount}</div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Registered Equipments
            </p>
          </CardContent>
        </Card>

        {/* Active Reservations Card */}
        <Card className="border border-blue-200 dark:border-blue-900 shadow-sm hover:shadow-md transition-all duration-200 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-400">
              Active Reservations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-semibold text-blue-900 dark:text-blue-50 mb-1">
              {activeReservationCount}
            </p>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Current & Upcoming
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/reservations">
            <Button className="w-full h-20 text-base font-medium bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white border-0 shadow-sm hover:shadow transition-all duration-200">
              📅 Reservation Calendar
            </Button>
          </Link>
          <Link href="/buildings">
            <Button className="w-full h-20 text-base font-medium bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white border-0 shadow-sm hover:shadow transition-all duration-200">
              🏢 Building Management
            </Button>
          </Link>
          <Link href="/equipments">
            <Button className="w-full h-20 text-base font-medium bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white border-0 shadow-sm hover:shadow transition-all duration-200">
              🔧 Equipments Management
            </Button>
          </Link>
          <Link href="/profile">
            <Button className="w-full h-20 text-base font-medium bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-700 text-white border-0 shadow-sm hover:shadow transition-all duration-200">
              👤 Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Favorite Equipment */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Favorite Equipment{" "}
          {favoriteEquipments.length > 0 && `(${favoriteEquipments.length})`}
        </h2>
        {favoriteEquipments && favoriteEquipments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedFavorites.map((eq: Equipment) => (
                <Link key={eq.id} href={`/equipments/${eq.id}`}>
                  <Card className="h-full hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 cursor-pointer">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {eq.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {eq.location
                            ? `${eq.location.buildingName} > ${eq.location.floorName} > ${eq.location.roomName}`
                            : "No location"}
                        </p>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500 flex-shrink-0 ml-4">
                        <Heart className="h-5 w-5 fill-red-500" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls for Favorite Equipment */}
            {favoriteTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {favoriteStartIndex + 1} -{" "}
                  {Math.min(favoriteEndIndex, favoriteEquipments.length)} of{" "}
                  {favoriteEquipments.length} items
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFavoritePage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={favoritePage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page {favoritePage} / {favoriteTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setFavoritePage((prev) =>
                        Math.min(favoriteTotalPages, prev + 1),
                      )
                    }
                    disabled={favoritePage === favoriteTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-full text-red-500">
                  <Heart className="h-6 w-6" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  No favorite equipment
                </p>
                <Link href="/equipments">
                  <Button variant="outline" size="sm" className="mt-2">
                    View Equipment List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recently Used Equipment */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Recently Used Equipment{" "}
          {recentlyUsedEquipments.length > 0 &&
            `(${recentlyUsedEquipments.length})`}
        </h2>
        {recentlyUsedEquipments && recentlyUsedEquipments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginatedRecentlyUsed.map((eq: Equipment) => (
                <Link key={eq.id} href={`/equipments/${eq.id}`}>
                  <Card className="h-full hover:shadow-md transition-all duration-200 border-slate-200 dark:border-slate-700 cursor-pointer">
                    <CardContent className="p-4 flex items-center space-x-4">
                      <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500 flex-shrink-0">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-50 truncate">
                          {eq.name}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                          {eq.location
                            ? `${eq.location.buildingName} > ${eq.location.floorName} > ${eq.location.roomName}`
                            : "No location"}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination Controls for Recently Used Equipment */}
            {recentlyUsedTotalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {recentlyUsedStartIndex + 1} -{" "}
                  {Math.min(
                    recentlyUsedEndIndex,
                    recentlyUsedEquipments.length,
                  )}{" "}
                  of {recentlyUsedEquipments.length} items
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRecentlyUsedPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={recentlyUsedPage === 1}
                  >
                    Previous
                  </Button>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Page {recentlyUsedPage} / {recentlyUsedTotalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setRecentlyUsedPage((prev) =>
                        Math.min(recentlyUsedTotalPages, prev + 1),
                      )
                    }
                    disabled={recentlyUsedPage === recentlyUsedTotalPages}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Card className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full text-blue-500">
                  <Clock className="h-6 w-6" />
                </div>
                <p className="text-slate-500 dark:text-slate-400">
                  No recently used equipment
                </p>
                <Link href="/equipments">
                  <Button variant="outline" size="sm" className="mt-2">
                    View Equipment List
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Reservations */}
      <div>
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-50 mb-4">
          Recent Reservations{" "}
          {recentReservations.length > 0 && `(${recentReservations.length})`}
        </h2>
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            {recentReservations.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">
                No reservations
              </p>
            ) : (
              <>
                <div className="space-y-4">
                  {paginatedReservations.map((reservation: Reservation) => (
                    <div
                      key={reservation.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
                    >
                      <div className="flex-1 mb-2 sm:mb-0">
                        <p className="font-semibold text-slate-900 dark:text-slate-50">
                          {reservation.equipment?.name || "No equipment name"}
                        </p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Booked by: {reservation.booker?.name || "Unknown"}
                        </p>
                        {reservation.comment && (
                          <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                            {reservation.comment}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        <p>
                          {new Date(reservation.startTime).toLocaleString(
                            "ja-JP",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                          {" 〜 "}
                          {new Date(reservation.endTime).toLocaleString(
                            "ja-JP",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination Controls for Recent Reservations */}
                {reservationsTotalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {reservationsStartIndex + 1} -{" "}
                      {Math.min(
                        reservationsEndIndex,
                        recentReservations.length,
                      )}{" "}
                      of {recentReservations.length} items
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReservationsPage((prev) => Math.max(1, prev - 1))
                        }
                        disabled={reservationsPage === 1}
                      >
                        Previous
                      </Button>
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Page {reservationsPage} / {reservationsTotalPages}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          setReservationsPage((prev) =>
                            Math.min(reservationsTotalPages, prev + 1),
                          )
                        }
                        disabled={reservationsPage === reservationsTotalPages}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

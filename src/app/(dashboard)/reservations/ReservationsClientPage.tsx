"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import EquipmentCalendar from "@/components/calendar/EquipmentCalendar";
import EquipmentFilter from "@/components/equipment/EquipmentFilter";
import { Equipment } from "@/domain/models/Equipment/Equipment";
import { Reservation } from "@/domain/models/Reservation/Reservation";
import { Building } from "@/domain/models/Building/Building";
import { Floor } from "@/domain/models/Floor/Floor";
import { Room } from "@/domain/models/Room/Room";
import { EquipmentCategory } from "@/domain/models/Equipment/EquipmentCategory";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Heart } from "lucide-react";
import { getEquipmentColor } from "@/lib/utils";

type Props = {
  initialEquipments: Equipment[];
  reservations: Reservation[];
  timezone: string;
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  categories: EquipmentCategory[];
  currentUser: {
    id: string;
    email: string;
    name: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    phoneNumber: string | null;
    department: string | null;
    role: string;
  } | null;
  favoriteEquipmentIds: string[];
};

export default function ReservationsClientPage({
  initialEquipments,
  reservations,
  timezone,
  buildings,
  floors,
  rooms,
  categories,
  currentUser,
  favoriteEquipmentIds,
}: Props) {
  const [filteredEquipments, setFilteredEquipments] =
    useState<Equipment[]>(initialEquipments);
  const [checkedEquipmentIds, setCheckedEquipmentIds] = useState<Set<string>>(
    new Set(),
  );
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);

  // Use ref to track the latest filteredEquipments for reset callback
  const filteredEquipmentsRef = useRef<Equipment[]>(filteredEquipments);
  useEffect(() => {
    filteredEquipmentsRef.current = filteredEquipments;
  }, [filteredEquipments]);

  // Memoize the filter change handler to prevent infinite loops
  const handleFilterChange = useCallback((filtered: Equipment[]) => {
    setFilteredEquipments(filtered);
  }, []);

  // Handle reset filters - reset checked equipment IDs to all filtered equipments
  const handleResetFilters = useCallback(() => {
    // Reset checked equipment IDs to all filtered equipments
    // Use setTimeout to ensure this runs after the filter state is reset
    // and filteredEquipments is updated
    setTimeout(() => {
      const currentFiltered = filteredEquipmentsRef.current;
      setCheckedEquipmentIds(new Set(currentFiltered.map((eq) => eq.id)));
    }, 0);
  }, []);

  // Update checked items when filter changes
  useEffect(() => {
    const newCheckedIds = new Set(filteredEquipments.map((eq) => eq.id));
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCheckedEquipmentIds(newCheckedIds);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [filteredEquipments]);

  const toggleEquipment = (id: string) => {
    const newChecked = new Set(checkedEquipmentIds);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedEquipmentIds(newChecked);
  };

  const toggleAll = () => {
    if (checkedEquipmentIds.size === filteredEquipments.length) {
      setCheckedEquipmentIds(new Set());
    } else {
      setCheckedEquipmentIds(new Set(filteredEquipments.map((eq) => eq.id)));
    }
  };

  // Filter reservations based on checked equipment
  const visibleReservations = reservations.filter(
    (r) => r.equipmentId && checkedEquipmentIds.has(r.equipmentId),
  );

  // Pagination calculations
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipments = filteredEquipments.slice(startIndex, endIndex);

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Reservations</h1>

        <EquipmentFilter
          equipments={initialEquipments}
          buildings={buildings}
          floors={floors}
          rooms={rooms}
          categories={categories}
          favoriteEquipmentIds={favoriteEquipmentIds}
          onFilterChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Filtered Results List */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex justify-between items-center mb-4">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => setIsExpanded(!isExpanded)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsExpanded(!isExpanded);
                }
              }}
              role="button"
              tabIndex={0}
            >
              <h3 className="text-lg font-semibold">
                Equipments ({filteredEquipments.length})
              </h3>
              <span className="text-sm text-gray-500">
                {isExpanded ? "▼" : "▶"}
              </span>
            </div>
          </div>

          {isExpanded && filteredEquipments.length > 0 && (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 w-10">
                        <input
                          type="checkbox"
                          checked={
                            filteredEquipments.length > 0 &&
                            checkedEquipmentIds.size ===
                              filteredEquipments.length
                          }
                          onChange={toggleAll}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-4 py-2">Color</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Location</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEquipments.map((eq) => {
                      const isFavorite = favoriteEquipmentIds.includes(eq.id);
                      const equipmentColor = getEquipmentColor(eq.id);
                      return (
                        <tr key={eq.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            <input
                              type="checkbox"
                              checked={checkedEquipmentIds.has(eq.id)}
                              onChange={() => toggleEquipment(eq.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 py-2">
                            <div
                              className="w-6 h-6 rounded border border-gray-300"
                              style={{ backgroundColor: equipmentColor }}
                              title={`Calendar color: ${equipmentColor}`}
                            />
                          </td>
                          <td className="px-4 py-2 font-medium text-gray-900">
                            <div className="flex items-center justify-between">
                              <Link
                                href={`/equipments/${eq.id}`}
                                className="hover:underline text-blue-600"
                              >
                                {eq.name}
                              </Link>
                              {isFavorite && (
                                <Heart className="h-4 w-4 text-red-500 fill-red-500 ml-2 flex-shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {eq.location
                              ? `${eq.location.buildingName} > ${eq.location.floorName} > ${eq.location.roomName}`
                              : "-"}
                          </td>
                          <td className="px-4 py-2">
                            {eq.categoryMajor}
                            {eq.categoryMinor && ` / ${eq.categoryMinor}`}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                eq.runningState === "OPERATIONAL"
                                  ? "bg-green-100 text-green-800"
                                  : eq.runningState === "MAINTENANCE"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : eq.runningState === "OUT_OF_SERVICE"
                                      ? "bg-red-100 text-red-800"
                                      : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {eq.runningState}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} -{" "}
                    {Math.min(endIndex, filteredEquipments.length)} of{" "}
                    {filteredEquipments.length} items
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-gray-700">
                      Page {currentPage} / {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}

          {isExpanded && filteredEquipments.length === 0 && (
            <p className="text-gray-500 text-center py-4">
              No equipment matches the current filters.
            </p>
          )}
        </div>

        <div className="mt-8">
          <EquipmentCalendar
            reservations={visibleReservations}
            equipments={filteredEquipments}
            timezone={timezone}
            currentUser={currentUser}
            checkedEquipmentIds={checkedEquipmentIds}
          />
        </div>
      </div>
    </main>
  );
}

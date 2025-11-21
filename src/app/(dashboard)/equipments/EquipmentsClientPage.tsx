"use client";

import { useState, useEffect } from "react";
import EquipmentFilter from "@/components/equipment/EquipmentFilter";
import EquipmentManager from "@/components/equipment/EquipmentManager";
import { Equipment } from "@/domain/models/Equipment/Equipment";
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
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  categories: EquipmentCategory[];
  favoriteEquipmentIds: string[];
  userRole?: string;
};

export default function EquipmentsClientPage({
  initialEquipments,
  buildings,
  floors,
  rooms,
  categories,
  favoriteEquipmentIds,
  userRole,
}: Props) {
  const [filteredEquipments, setFilteredEquipments] =
    useState<Equipment[]>(initialEquipments);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(10);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // Reset to first page when filter changes
  useEffect(() => {
    if (filteredEquipments.length > 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCurrentPage(1);
    }
  }, [filteredEquipments.length]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEquipments = filteredEquipments.slice(startIndex, endIndex);

  const getRoomName = (roomId: string | null) => {
    if (!roomId) return "-";
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return "Unknown Room";
    const floor = floors.find((f) => f.id === room.floorId);
    if (!floor) return room.name;
    const building = buildings.find((b) => b.id === floor.buildingId);
    if (!building) return `${floor.name} / ${room.name}`;
    return `${building.name} > ${floor.name} > ${room.name}`;
  };

  const canManageEquipment = userRole === "ADMIN" || userRole === "EDITOR";

  return (
    <main className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-4">Equipment Management</h1>

        <EquipmentFilter
          equipments={initialEquipments}
          buildings={buildings}
          floors={floors}
          rooms={rooms}
          categories={categories}
          favoriteEquipmentIds={favoriteEquipmentIds}
          onFilterChange={setFilteredEquipments}
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
                      <th className="px-4 py-2">Color</th>
                      <th className="px-4 py-2">Name</th>
                      <th className="px-4 py-2">Category</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Location</th>
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
                            {eq.categoryMajor || "-"}
                            {eq.categoryMinor ? ` / ${eq.categoryMinor}` : ""}
                          </td>
                          <td className="px-4 py-2">{eq.description || "-"}</td>
                          <td className="px-4 py-2">
                            {getRoomName(eq.roomId)}
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

        {/* Equipment Management Section */}
        {canManageEquipment && (
          <div className="mt-8">
            <EquipmentManager
              equipments={initialEquipments}
              rooms={rooms}
              floors={floors}
              buildings={buildings}
              categories={categories}
              userRole={userRole}
              hideList={true}
            />
          </div>
        )}
      </div>
    </main>
  );
}

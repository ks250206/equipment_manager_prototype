"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Equipment } from "@/domain/models/Equipment/Equipment";
import { Building } from "@/domain/models/Building/Building";
import { Floor } from "@/domain/models/Floor/Floor";
import { Room } from "@/domain/models/Room/Room";
import { EquipmentCategory } from "@/domain/models/Equipment/EquipmentCategory";

type Props = {
  equipments: Equipment[];
  buildings: Building[];
  floors: Floor[];
  rooms: Room[];
  categories: EquipmentCategory[];
  favoriteEquipmentIds?: string[];
  onFilterChange: (filtered: Equipment[]) => void;
  onReset?: () => void;
};

export default function EquipmentFilter({
  equipments,
  buildings,
  floors,
  rooms,
  categories,
  favoriteEquipmentIds = [],
  onFilterChange,
  onReset,
}: Props) {
  const [nameFilter, setNameFilter] = useState("");
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>("all");
  const [selectedFloorId, setSelectedFloorId] = useState<string>("all");
  const [selectedRoomId, setSelectedRoomId] = useState<string>("all");
  const [selectedCategoryMajor, setSelectedCategoryMajor] =
    useState<string>("all");
  const [selectedCategoryMinor, setSelectedCategoryMinor] =
    useState<string>("all");
  const [selectedRunningState, setSelectedRunningState] =
    useState<string>("all");
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Use ref to store the latest onFilterChange callback to avoid dependency issues
  const onFilterChangeRef = useRef(onFilterChange);
  useEffect(() => {
    onFilterChangeRef.current = onFilterChange;
  }, [onFilterChange]);

  // Memoize favoriteEquipmentIds to prevent unnecessary re-renders
  const favoriteIdsSet = useMemo(
    () => new Set(favoriteEquipmentIds),
    [favoriteEquipmentIds],
  );

  // Memoize rooms and floors maps for efficient lookups
  const roomsMap = useMemo(() => {
    const map = new Map();
    rooms.forEach((room) => map.set(room.id, room));
    return map;
  }, [rooms]);

  const floorsMap = useMemo(() => {
    const map = new Map();
    floors.forEach((floor) => map.set(floor.id, floor));
    return map;
  }, [floors]);

  // Derived state for dependent dropdowns
  const filteredFloors = floors.filter(
    (f) => selectedBuildingId === "all" || f.buildingId === selectedBuildingId,
  );
  const filteredRooms = rooms.filter(
    (r) => selectedFloorId === "all" || r.floorId === selectedFloorId,
  );
  const uniqueMajors = Array.from(
    new Set(categories.map((c) => c.categoryMajor)),
  );
  const filteredMinors = categories
    .filter(
      (c) =>
        selectedCategoryMajor === "all" ||
        c.categoryMajor === selectedCategoryMajor,
    )
    .map((c) => c.categoryMinor);

  useEffect(() => {
    const filtered = equipments.filter((eq) => {
      // Name filter (partial match, case insensitive)
      if (
        nameFilter &&
        !eq.name.toLowerCase().includes(nameFilter.toLowerCase())
      ) {
        return false;
      }

      // Building/Floor/Room filter
      // We need to find the room for the equipment to check building/floor
      // Since equipment has roomId, we can check against that.
      // But for building/floor, we need to traverse up.
      // Fortunately, we have the full lists of rooms/floors/buildings.

      if (selectedRoomId !== "all" && eq.roomId !== selectedRoomId) {
        return false;
      }

      if (selectedFloorId !== "all") {
        const room = roomsMap.get(eq.roomId);
        if (!room || room.floorId !== selectedFloorId) {
          return false;
        }
      }

      if (selectedBuildingId !== "all") {
        const room = roomsMap.get(eq.roomId);
        if (!room) return false;
        const floor = floorsMap.get(room.floorId);
        if (!floor || floor.buildingId !== selectedBuildingId) {
          return false;
        }
      }

      // Category filter
      if (
        selectedCategoryMajor !== "all" &&
        eq.categoryMajor !== selectedCategoryMajor
      ) {
        return false;
      }
      if (
        selectedCategoryMinor !== "all" &&
        eq.categoryMinor !== selectedCategoryMinor
      ) {
        return false;
      }

      // Running State filter
      if (
        selectedRunningState !== "all" &&
        eq.runningState !== selectedRunningState
      ) {
        return false;
      }

      // Favorite filter
      if (showFavoritesOnly && !favoriteIdsSet.has(eq.id)) {
        return false;
      }

      return true;
    });

    onFilterChangeRef.current(filtered);
  }, [
    equipments,
    nameFilter,
    selectedBuildingId,
    selectedFloorId,
    selectedRoomId,
    selectedCategoryMajor,
    selectedCategoryMinor,
    selectedRunningState,
    showFavoritesOnly,
    favoriteIdsSet,
    roomsMap,
    floorsMap,
  ]);

  const handleReset = () => {
    setNameFilter("");
    setSelectedBuildingId("all");
    setSelectedFloorId("all");
    setSelectedRoomId("all");
    setSelectedCategoryMajor("all");
    setSelectedCategoryMinor("all");
    setSelectedRunningState("all");
    setShowFavoritesOnly(false);
    // Call onReset callback if provided
    if (onReset) {
      onReset();
    }
  };

  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
      <div className="flex justify-between items-center">
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
          <h3 className="text-lg font-semibold">Filter Equipments</h3>
          <span className="text-sm text-gray-500">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleReset}>
            Reset Filters
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Name Filter */}
          <div className="space-y-2">
            <Label htmlFor="name-filter">Equipment Name</Label>
            <Input
              id="name-filter"
              placeholder="Search by name..."
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
            />
          </div>

          {/* Building Filter */}
          <div className="space-y-2">
            <Label>Building</Label>
            <Select
              value={selectedBuildingId}
              onValueChange={setSelectedBuildingId}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Buildings" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buildings</SelectItem>
                {buildings.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Floor Filter */}
          <div className="space-y-2">
            <Label>Floor</Label>
            <Select
              value={selectedFloorId}
              onValueChange={setSelectedFloorId}
              disabled={selectedBuildingId === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Floors</SelectItem>
                {filteredFloors.map((f) => (
                  <SelectItem key={f.id} value={f.id}>
                    {f.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Room Filter */}
          <div className="space-y-2">
            <Label>Room</Label>
            <Select
              value={selectedRoomId}
              onValueChange={setSelectedRoomId}
              disabled={selectedFloorId === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Rooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Rooms</SelectItem>
                {filteredRooms.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Major Filter */}
          <div className="space-y-2">
            <Label>Category (Major)</Label>
            <Select
              value={selectedCategoryMajor}
              onValueChange={setSelectedCategoryMajor}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueMajors.map((major) => (
                  <SelectItem key={major} value={major}>
                    {major}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category Minor Filter */}
          <div className="space-y-2">
            <Label>Category (Minor)</Label>
            <Select
              value={selectedCategoryMinor}
              onValueChange={setSelectedCategoryMinor}
              disabled={selectedCategoryMajor === "all"}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Subcategories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subcategories</SelectItem>
                {filteredMinors.map((minor) => (
                  <SelectItem key={minor} value={minor}>
                    {minor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Running State Filter */}
          <div className="space-y-2">
            <Label>Running State</Label>
            <Select
              value={selectedRunningState}
              onValueChange={setSelectedRunningState}
            >
              <SelectTrigger>
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="OPERATIONAL">Operational</SelectItem>
                <SelectItem value="MAINTENANCE">Maintenance</SelectItem>
                <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
                <SelectItem value="RETIRED">Retired</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Favorite Filter */}
          <div className="space-y-2 flex items-center gap-2 pt-6">
            <Checkbox
              id="favorite-filter"
              checked={showFavoritesOnly}
              onCheckedChange={(checked) =>
                setShowFavoritesOnly(checked === true)
              }
            />
            <Label htmlFor="favorite-filter" className="cursor-pointer">
              Show favorites only
            </Label>
          </div>
        </div>
      )}
    </div>
  );
}

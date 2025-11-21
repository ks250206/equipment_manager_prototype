"use client";

import { useState, useActionState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createEquipmentAction,
  updateEquipmentAction,
  deleteEquipmentAction,
} from "@/application/actions/equipment";
import { getEquipmentColor } from "@/lib/utils";

type Equipment = {
  id: string;
  name: string;
  description: string | null;
  categoryMajor: string | null;
  categoryMinor: string | null;
  roomId: string | null;
};

type EquipmentCategory = {
  id: string;
  categoryMajor: string;
  categoryMinor: string;
};

type Building = {
  id: string;
  name: string;
};

type Floor = {
  id: string;
  name: string;
  buildingId: string;
};

type Room = {
  id: string;
  name: string;
  floorId: string | null;
};

type Props = {
  equipments: Equipment[];
  rooms: Room[];
  floors: Floor[];
  buildings: Building[];
  categories: EquipmentCategory[];
  userRole?: string;
  hideList?: boolean;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

export default function EquipmentManager({
  equipments,
  rooms,
  floors,
  buildings,
  categories,
  userRole,
  hideList = false,
}: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(
    null,
  );
  const [equipmentToDelete, setEquipmentToDelete] = useState<Equipment | null>(
    null,
  );

  const [selectedBuilding, setSelectedBuilding] = useState<string>("");
  const [selectedFloor, setSelectedFloor] = useState<string>("");
  const [categoryMajorFilter, setCategoryMajorFilter] = useState("");
  const [categoryMinorFilter, setCategoryMinorFilter] = useState("");
  const [createFormCategoryMajor, setCreateFormCategoryMajor] = useState("");
  const [createFormCategoryMinor, setCreateFormCategoryMinor] = useState("");
  const [editFormCategoryMajor, setEditFormCategoryMajor] = useState("");
  const [editFormCategoryMinor, setEditFormCategoryMinor] = useState("");

  const [createState, createFormAction, isCreating] = useActionState(
    createEquipmentAction,
    initialState,
  );
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateEquipmentAction,
    initialState,
  );

  useEffect(() => {
    if (createState.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreateModalOpen(false);
    }
  }, [createState.success]);

  useEffect(() => {
    if (updateState.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsEditModalOpen(false);
    }
  }, [updateState.success]);

  const handleEdit = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    const room = rooms.find((r) => r.id === equipment.roomId);
    const floor = room ? floors.find((f) => f.id === room.floorId) : null;
    const building = floor
      ? buildings.find((b) => b.id === floor.buildingId)
      : null;

    setSelectedBuilding(building?.id || "");
    setSelectedFloor(floor?.id || "");
    setEditFormCategoryMajor(equipment.categoryMajor || "");
    setEditFormCategoryMinor(equipment.categoryMinor || "");
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (equipment: Equipment) => {
    setEquipmentToDelete(equipment);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!equipmentToDelete) return;

    const result = await deleteEquipmentAction(equipmentToDelete.id);
    setIsDeleteDialogOpen(false);
    setEquipmentToDelete(null);

    if (result.error) {
      alert(result.error);
    }
  };

  const getRoomName = (roomId: string | null) => {
    if (!roomId) return "-";
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return "Unknown Room";
    const floor = floors.find((f) => f.id === room.floorId);
    if (!floor) return room.name;
    const building = buildings.find((b) => b.id === floor.buildingId);
    if (!building) return `${floor.name} / ${room.name}`;
    return `${building.name} / ${floor.name} / ${room.name}`;
  };

  const filteredFloors = floors.filter(
    (floor) => floor.buildingId === selectedBuilding,
  );
  const filteredRooms = rooms.filter((room) => room.floorId === selectedFloor);

  // Get category options from categories prop instead of equipments
  const categoryMajors = Array.from(
    new Set(categories.map((category) => category.categoryMajor)),
  );
  const categoryMinors = categoryMajorFilter
    ? Array.from(
        new Set(
          categories
            .filter(
              (category) => category.categoryMajor === categoryMajorFilter,
            )
            .map((category) => category.categoryMinor),
        ),
      )
    : [];

  // Filter equipments based on selected categories
  const displayedEquipments = equipments.filter((eq) => {
    const matchesMajor = categoryMajorFilter
      ? eq.categoryMajor === categoryMajorFilter
      : true;
    const matchesMinor = categoryMinorFilter
      ? eq.categoryMinor === categoryMinorFilter
      : true;
    return matchesMajor && matchesMinor;
  });

  const availableCategoryMajors = Array.from(
    new Set(categories.map((category) => category.categoryMajor)),
  );
  const getMinorsForMajor = useCallback(
    (major: string) =>
      categories
        .filter((category) => category.categoryMajor === major)
        .map((category) => category.categoryMinor),
    [categories],
  );
  const createCategoryMinorOptions = createFormCategoryMajor
    ? getMinorsForMajor(createFormCategoryMajor)
    : [];
  const editCategoryMajorOptions =
    editFormCategoryMajor &&
    !availableCategoryMajors.includes(editFormCategoryMajor)
      ? [...availableCategoryMajors, editFormCategoryMajor]
      : availableCategoryMajors;
  const editCategoryMinorOptions = editFormCategoryMajor
    ? Array.from(
        new Set([
          ...getMinorsForMajor(editFormCategoryMajor),
          ...(selectedEquipment &&
          selectedEquipment.categoryMajor === editFormCategoryMajor &&
          selectedEquipment.categoryMinor
            ? [selectedEquipment.categoryMinor]
            : []),
        ]),
      )
    : [];

  useEffect(() => {
    if (createFormCategoryMajor) {
      const minors = getMinorsForMajor(createFormCategoryMajor);
      if (!minors.includes(createFormCategoryMinor)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCreateFormCategoryMinor(minors[0] || "");
      }
    } else {
      setCreateFormCategoryMinor("");
    }
  }, [
    createFormCategoryMajor,
    createFormCategoryMinor,
    categories,
    getMinorsForMajor,
  ]);

  useEffect(() => {
    if (editFormCategoryMajor) {
      const minors = getMinorsForMajor(editFormCategoryMajor);
      if (
        editFormCategoryMinor &&
        (minors.length === 0 || !minors.includes(editFormCategoryMinor)) &&
        !(
          selectedEquipment &&
          selectedEquipment.categoryMajor === editFormCategoryMajor
        )
      ) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setEditFormCategoryMinor(minors[0] || "");
      }
    }
  }, [
    editFormCategoryMajor,
    editFormCategoryMinor,
    categories,
    getMinorsForMajor,
    selectedEquipment,
  ]);

  const handleOpenCreateModal = () => {
    setSelectedBuilding("");
    setSelectedFloor("");
    const defaultMajor = availableCategoryMajors[0] || "";
    setCreateFormCategoryMajor(defaultMajor);
    const defaultMinor = defaultMajor
      ? getMinorsForMajor(defaultMajor)[0] || ""
      : "";
    setCreateFormCategoryMinor(defaultMinor);
    setIsCreateModalOpen(true);
  };

  const canManageEquipment = userRole === "ADMIN" || userRole === "EDITOR";

  return (
    <div className="space-y-4">
      {!hideList && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Equipment Management</h2>
            {canManageEquipment && (
              <Button onClick={handleOpenCreateModal}>Add Equipment</Button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label htmlFor="filter-category-major">Category Major</Label>
              <select
                id="filter-category-major"
                value={categoryMajorFilter}
                onChange={(e) => {
                  setCategoryMajorFilter(e.target.value);
                  setCategoryMinorFilter("");
                }}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {categoryMajors.map((major) => (
                  <option key={major} value={major}>
                    {major}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="filter-category-minor">Category Minor</Label>
              <select
                id="filter-category-minor"
                value={categoryMinorFilter}
                onChange={(e) => setCategoryMinorFilter(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="">All</option>
                {categoryMinors.map((minor) => (
                  <option key={minor} value={minor}>
                    {minor}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Color</th>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  {canManageEquipment && (
                    <th className="px-4 py-2 text-right">Actions</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {displayedEquipments.map((eq) => {
                  const equipmentColor = getEquipmentColor(eq.id);
                  return (
                    <tr key={eq.id} className="border-t">
                      <td className="px-4 py-2">
                        <div
                          className="w-6 h-6 rounded border border-gray-300"
                          style={{ backgroundColor: equipmentColor }}
                          title={`Calendar color: ${equipmentColor}`}
                        />
                      </td>
                      <td className="px-4 py-2">{eq.name}</td>
                      <td className="px-4 py-2">
                        {eq.categoryMajor || "-"}
                        {eq.categoryMinor ? ` / ${eq.categoryMinor}` : ""}
                      </td>
                      <td className="px-4 py-2">{eq.description || "-"}</td>
                      <td className="px-4 py-2">{getRoomName(eq.roomId)}</td>
                      {canManageEquipment && (
                        <td className="px-4 py-2 text-right space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(eq)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteClick(eq)}
                          >
                            Delete
                          </Button>
                        </td>
                      )}
                    </tr>
                  );
                })}
                {displayedEquipments.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      No equipment found. Adjust the filters or click &quot;Add
                      Equipment&quot; to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {hideList && canManageEquipment && (
        <div className="flex justify-end">
          <Button onClick={handleOpenCreateModal}>Add Equipment</Button>
        </div>
      )}

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Equipment</DialogTitle>
          </DialogHeader>
          <form action={createFormAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Input id="description" name="description" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryMajor">Category Major</Label>
                <select
                  id="categoryMajor"
                  name="categoryMajor"
                  value={createFormCategoryMajor}
                  onChange={(e) => setCreateFormCategoryMajor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={categories.length === 0}
                  required
                >
                  <option value="">Select a category</option>
                  {availableCategoryMajors.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="categoryMinor">Category Minor</Label>
                <select
                  id="categoryMinor"
                  name="categoryMinor"
                  value={createFormCategoryMinor}
                  onChange={(e) => setCreateFormCategoryMinor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={categories.length === 0 || !createFormCategoryMajor}
                  required
                >
                  <option value="">Select a minor</option>
                  {createCategoryMinorOptions.map((minor) => (
                    <option key={minor} value={minor}>
                      {minor}
                    </option>
                  ))}
                </select>
              </div>
              {categories.length === 0 && (
                <div className="text-sm text-red-500">
                  Register a category before creating equipment.
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="building">Building</Label>
                <select
                  id="building"
                  value={selectedBuilding}
                  onChange={(e) => {
                    setSelectedBuilding(e.target.value);
                    setSelectedFloor("");
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a building</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floor">Floor</Label>
                <select
                  id="floor"
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  disabled={!selectedBuilding}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a floor</option>
                  {filteredFloors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="roomId">Room</Label>
                <select
                  id="roomId"
                  name="roomId"
                  disabled={!selectedFloor}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No room assigned</option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {createState?.error && (
                <div className="text-red-500 text-sm">{createState.error}</div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Equipment</DialogTitle>
          </DialogHeader>
          <form action={updateFormAction}>
            <input
              type="hidden"
              name="id"
              value={selectedEquipment?.id || ""}
            />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedEquipment?.name || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  name="description"
                  defaultValue={selectedEquipment?.description || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-categoryMajor">Category Major</Label>
                <select
                  id="edit-categoryMajor"
                  name="categoryMajor"
                  value={editFormCategoryMajor}
                  onChange={(e) => setEditFormCategoryMajor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a category</option>
                  {editCategoryMajorOptions.map((major) => (
                    <option key={major} value={major}>
                      {major}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-categoryMinor">Category Minor</Label>
                <select
                  id="edit-categoryMinor"
                  name="categoryMinor"
                  value={editFormCategoryMinor}
                  onChange={(e) => setEditFormCategoryMinor(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={!editFormCategoryMajor}
                >
                  <option value="">Select a minor</option>
                  {editCategoryMinorOptions.map((minor) => (
                    <option key={minor} value={minor}>
                      {minor}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-building">Building</Label>
                <select
                  id="edit-building"
                  value={selectedBuilding}
                  onChange={(e) => {
                    setSelectedBuilding(e.target.value);
                    setSelectedFloor("");
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a building</option>
                  {buildings.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-floor">Floor</Label>
                <select
                  id="edit-floor"
                  value={selectedFloor}
                  onChange={(e) => setSelectedFloor(e.target.value)}
                  disabled={!selectedBuilding}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a floor</option>
                  {filteredFloors.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-roomId">Room</Label>
                <select
                  id="edit-roomId"
                  name="roomId"
                  defaultValue={selectedEquipment?.roomId || ""}
                  disabled={!selectedFloor}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">No room assigned</option>
                  {filteredRooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
              {updateState?.error && (
                <div className="text-red-500 text-sm">{updateState.error}</div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Equipment</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{equipmentToDelete?.name}
              &quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteConfirm}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

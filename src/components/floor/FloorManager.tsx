"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
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
  createFloorAction,
  updateFloorAction,
  deleteFloorAction,
} from "@/application/actions/floor";

type Floor = {
  id: string;
  name: string;
  buildingId: string;
  floorNumber: number | null;
};

type Building = {
  id: string;
  name: string;
};

type Props = {
  floors: Floor[];
  buildings: Building[];
  selectedBuildingId?: string;
  userRole?: string;
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

export default function FloorManager({
  floors,
  buildings,
  selectedBuildingId,
  userRole,
}: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState<Floor | null>(null);
  const [floorToDelete, setFloorToDelete] = useState<Floor | null>(null);

  const [createState, createFormAction, isCreating] = useActionState(
    createFloorAction,
    initialState,
  );
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateFloorAction,
    initialState,
  );

  const handleEdit = (floor: Floor) => {
    setSelectedFloor(floor);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (floor: Floor) => {
    setFloorToDelete(floor);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!floorToDelete) return;

    const result = await deleteFloorAction(floorToDelete.id);
    setIsDeleteDialogOpen(false);
    setFloorToDelete(null);

    if (result.error) {
      alert(result.error);
    }
  };

  const getBuildingName = (buildingId: string) => {
    return buildings.find((b) => b.id === buildingId)?.name || "Unknown";
  };

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Floor Management</h2>
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)}>Add Floor</Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Building</th>
              <th className="px-4 py-2 text-left">Floor Number</th>
              {isAdmin && <th className="px-4 py-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {floors.map((floor) => (
              <tr key={floor.id} className="border-t">
                <td className="px-4 py-2">
                  <Link
                    href={`/buildings/${floor.buildingId}/floors/${floor.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {floor.name}
                  </Link>
                </td>
                <td className="px-4 py-2">
                  {getBuildingName(floor.buildingId)}
                </td>
                <td className="px-4 py-2">{floor.floorNumber ?? "-"}</td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(floor)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(floor)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {floors.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No floors found. Click &quot;Add Floor&quot; to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Floor</DialogTitle>
          </DialogHeader>
          <form action={createFormAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="buildingId">Building</Label>
                {selectedBuildingId ? (
                  <>
                    <input
                      type="hidden"
                      name="buildingId"
                      value={selectedBuildingId}
                    />
                    <Input
                      disabled
                      value={
                        buildings.find((b) => b.id === selectedBuildingId)
                          ?.name || "Unknown Building"
                      }
                    />
                  </>
                ) : (
                  <select
                    id="buildingId"
                    name="buildingId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue=""
                    required
                  >
                    <option value="">Select a building</option>
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floorNumber">Floor Number</Label>
                <Input id="floorNumber" name="floorNumber" type="number" />
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
            <DialogTitle>Edit Floor</DialogTitle>
          </DialogHeader>
          <form action={updateFormAction}>
            <input type="hidden" name="id" value={selectedFloor?.id || ""} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedFloor?.name || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-buildingId">Building</Label>
                {selectedBuildingId ? (
                  <>
                    <input
                      type="hidden"
                      name="buildingId"
                      value={selectedBuildingId}
                    />
                    <Input
                      disabled
                      value={
                        buildings.find((b) => b.id === selectedBuildingId)
                          ?.name || "Unknown Building"
                      }
                    />
                  </>
                ) : (
                  <select
                    id="edit-buildingId"
                    name="buildingId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={selectedFloor?.buildingId || ""}
                    required
                  >
                    {buildings.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-floorNumber">Floor Number</Label>
                <Input
                  id="edit-floorNumber"
                  name="floorNumber"
                  type="number"
                  defaultValue={selectedFloor?.floorNumber?.toString() || ""}
                />
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
            <DialogTitle>Delete Floor</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{floorToDelete?.name}&quot;?
              This action cannot be undone.
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

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
  createBuildingAction,
  updateBuildingAction,
  deleteBuildingAction,
} from "@/application/actions/building";

type Building = {
  id: string;
  name: string;
  address: string | null;
};

type Props = {
  buildings: Building[];
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

export default function BuildingManager({ buildings, userRole }: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(
    null,
  );
  const [buildingToDelete, setBuildingToDelete] = useState<Building | null>(
    null,
  );

  const [createState, createFormAction, isCreating] = useActionState(
    createBuildingAction,
    initialState,
  );
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateBuildingAction,
    initialState,
  );

  const handleEdit = (building: Building) => {
    setSelectedBuilding(building);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (building: Building) => {
    setBuildingToDelete(building);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!buildingToDelete) return;

    const result = await deleteBuildingAction(buildingToDelete.id);
    setIsDeleteDialogOpen(false);
    setBuildingToDelete(null);

    if (result.error) {
      alert(result.error);
    }
  };

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Building Management</h2>
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)}>
            Add Building
          </Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Address</th>
              {isAdmin && <th className="px-4 py-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {buildings.map((building) => (
              <tr key={building.id} className="border-t">
                <td className="px-4 py-2">
                  <Link
                    href={`/buildings/${building.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {building.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{building.address || "-"}</td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(building)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(building)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {buildings.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-gray-500">
                  No buildings found. Click &quot;Add Building&quot; to create one.
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
            <DialogTitle>Add Building</DialogTitle>
          </DialogHeader>
          <form action={createFormAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" />
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
            <DialogTitle>Edit Building</DialogTitle>
          </DialogHeader>
          <form action={updateFormAction}>
            <input type="hidden" name="id" value={selectedBuilding?.id || ""} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedBuilding?.name || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-address">Address</Label>
                <Input
                  id="edit-address"
                  name="address"
                  defaultValue={selectedBuilding?.address || ""}
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
            <DialogTitle>Delete Building</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{buildingToDelete?.name}&quot;? This
              action cannot be undone.
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

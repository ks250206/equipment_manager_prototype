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
  createRoomAction,
  updateRoomAction,
  deleteRoomAction,
} from "@/application/actions/room";

type Room = {
  id: string;
  name: string;
  floorId: string;
  capacity: number | null;
};

type Floor = {
  id: string;
  name: string;
  buildingId: string;
};

type Props = {
  rooms: Room[];
  floors: Floor[];
  selectedFloorId?: string;
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

export default function RoomManager({
  rooms,
  floors,
  selectedFloorId,
  userRole,
}: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<Room | null>(null);

  const [createState, createFormAction, isCreating] = useActionState(
    createRoomAction,
    initialState,
  );
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateRoomAction,
    initialState,
  );

  const handleEdit = (room: Room) => {
    setSelectedRoom(room);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (room: Room) => {
    setRoomToDelete(room);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roomToDelete) return;

    const result = await deleteRoomAction(roomToDelete.id);
    setIsDeleteDialogOpen(false);
    setRoomToDelete(null);

    if (result.error) {
      alert(result.error);
    }
  };

  const getFloorName = (floorId: string) => {
    return floors.find((f) => f.id === floorId)?.name || "Unknown";
  };

  const isAdmin = userRole === "ADMIN";

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Room Management</h2>
        {isAdmin && (
          <Button onClick={() => setIsCreateModalOpen(true)}>Add Room</Button>
        )}
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Floor</th>
              <th className="px-4 py-2 text-left">Capacity</th>
              {isAdmin && <th className="px-4 py-2 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-t">
                <td className="px-4 py-2">
                  <Link
                    href={`/buildings/${floors.find((f) => f.id === room.floorId)?.buildingId}/floors/${room.floorId}/rooms/${room.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    {room.name}
                  </Link>
                </td>
                <td className="px-4 py-2">{getFloorName(room.floorId)}</td>
                <td className="px-4 py-2">{room.capacity ?? "-"}</td>
                {isAdmin && (
                  <td className="px-4 py-2 text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(room)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(room)}
                    >
                      Delete
                    </Button>
                  </td>
                )}
              </tr>
            ))}
            {rooms.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No rooms found. Click &quot;Add Room&quot; to create one.
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
            <DialogTitle>Add Room</DialogTitle>
          </DialogHeader>
          <form action={createFormAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="floorId">Floor</Label>
                {selectedFloorId ? (
                  <>
                    <input
                      type="hidden"
                      name="floorId"
                      value={selectedFloorId}
                    />
                    <Input
                      disabled
                      value={
                        floors.find((f) => f.id === selectedFloorId)?.name ||
                        "Unknown Floor"
                      }
                    />
                  </>
                ) : (
                  <select
                    id="floorId"
                    name="floorId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue=""
                    required
                  >
                    <option value="">Select a floor</option>
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input id="capacity" name="capacity" type="number" />
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
            <DialogTitle>Edit Room</DialogTitle>
          </DialogHeader>
          <form action={updateFormAction}>
            <input type="hidden" name="id" value={selectedRoom?.id || ""} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  defaultValue={selectedRoom?.name || ""}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-floorId">Floor</Label>
                {selectedFloorId ? (
                  <>
                    <input
                      type="hidden"
                      name="floorId"
                      value={selectedFloorId}
                    />
                    <Input
                      disabled
                      value={
                        floors.find((f) => f.id === selectedFloorId)?.name ||
                        "Unknown Floor"
                      }
                    />
                  </>
                ) : (
                  <select
                    id="edit-floorId"
                    name="floorId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={selectedRoom?.floorId || ""}
                    required
                  >
                    {floors.map((floor) => (
                      <option key={floor.id} value={floor.id}>
                        {floor.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-capacity">Capacity</Label>
                <Input
                  id="edit-capacity"
                  name="capacity"
                  type="number"
                  defaultValue={selectedRoom?.capacity?.toString() || ""}
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
            <DialogTitle>Delete Room</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{roomToDelete?.name}&quot;?
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

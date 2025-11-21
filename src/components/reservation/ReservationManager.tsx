"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  createReservationAction,
  updateReservationAction,
  deleteReservationAction,
} from "@/application/actions/reservation";

type Equipment = {
  id: string;
  name: string;
  description: string | null;
  categoryMajor: string | null;
  categoryMinor: string | null;
};

type Reservation = {
  id: string;
  startTime: Date;
  endTime: Date;
  comment: string | null;
  userId: string;
  equipmentId: string;
  booker?: {
    id: string;
    name: string | null;
  };
  equipment?: {
    id: string;
    name: string;
  };
};

type Props = {
  reservations: Reservation[];
  equipments: Equipment[];
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

function formatDateTime(date: Date): string {
  return new Date(date).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toDateTimeLocalString(date: Date): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ReservationManager({
  reservations,
  equipments,
}: Props) {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] =
    useState<Reservation | null>(null);
  const [reservationToDelete, setReservationToDelete] =
    useState<Reservation | null>(null);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [editEquipmentId, setEditEquipmentId] = useState<string>("");

  const [createState, createFormAction, isCreating] = useActionState(
    createReservationAction,
    initialState,
  );
  const [updateState, updateFormAction, isUpdating] = useActionState(
    updateReservationAction,
    initialState,
  );

  const handleEdit = (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setEditEquipmentId(reservation.equipmentId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (reservation: Reservation) => {
    setReservationToDelete(reservation);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!reservationToDelete) return;

    const result = await deleteReservationAction(reservationToDelete.id);
    setIsDeleteDialogOpen(false);
    setReservationToDelete(null);

    if (result.error) {
      alert(result.error);
    }
  };

  const getEquipmentName = (equipmentId: string) => {
    const equipment = equipments.find((eq) => eq.id === equipmentId);
    return equipment?.name || "Unknown";
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Reservation Management</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          Add Reservation
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left">Comment</th>
              <th className="px-4 py-2 text-left">Equipment</th>
              <th className="px-4 py-2 text-left">Booker</th>
              <th className="px-4 py-2 text-left">Start Time</th>
              <th className="px-4 py-2 text-left">End Time</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-t">
                <td className="px-4 py-2">{reservation.comment || "-"}</td>
                <td className="px-4 py-2">
                  {reservation.equipment?.name ||
                    getEquipmentName(reservation.equipmentId)}
                </td>
                <td className="px-4 py-2">{reservation.booker?.name || "-"}</td>
                <td className="px-4 py-2">
                  {formatDateTime(reservation.startTime)}
                </td>
                <td className="px-4 py-2">
                  {formatDateTime(reservation.endTime)}
                </td>
                <td className="px-4 py-2 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(reservation)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(reservation)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No reservations found. Click &quot;Add Reservation&quot; to create one.
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
            <DialogTitle>Add Reservation</DialogTitle>
          </DialogHeader>
          <form action={createFormAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="equipment">Equipment</Label>
                <Select
                  name="equipmentId"
                  value={selectedEquipmentId}
                  onValueChange={setSelectedEquipmentId}
                  required
                >
                  <SelectTrigger id="equipment">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name}
                        {eq.categoryMajor
                          ? ` (${eq.categoryMajor}${eq.categoryMinor ? ` / ${eq.categoryMinor}` : ""})`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="equipmentId"
                  value={selectedEquipmentId}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="comment">Comment</Label>
                <Input id="comment" name="comment" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="datetime-local"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="datetime-local"
                  required
                />
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
            <DialogTitle>Edit Reservation</DialogTitle>
          </DialogHeader>
          <form action={updateFormAction}>
            <input
              type="hidden"
              name="id"
              value={selectedReservation?.id || ""}
            />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-equipment">Equipment</Label>
                <Select
                  name="equipmentId"
                  value={editEquipmentId}
                  onValueChange={setEditEquipmentId}
                  required
                >
                  <SelectTrigger id="edit-equipment">
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipments.map((eq) => (
                      <SelectItem key={eq.id} value={eq.id}>
                        {eq.name}
                        {eq.categoryMajor
                          ? ` (${eq.categoryMajor}${eq.categoryMinor ? ` / ${eq.categoryMinor}` : ""})`
                          : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input
                  type="hidden"
                  name="equipmentId"
                  value={editEquipmentId}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-comment">Comment</Label>
                <Input
                  id="edit-comment"
                  name="comment"
                  defaultValue={selectedReservation?.comment || ""}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  name="startTime"
                  type="datetime-local"
                  defaultValue={
                    selectedReservation
                      ? toDateTimeLocalString(selectedReservation.startTime)
                      : ""
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  name="endTime"
                  type="datetime-local"
                  defaultValue={
                    selectedReservation
                      ? toDateTimeLocalString(selectedReservation.endTime)
                      : ""
                  }
                  required
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
            <DialogTitle>Delete Reservation</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this reservation? This action
              cannot be undone.
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

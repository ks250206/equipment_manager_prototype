"use client";

import { MaintenanceRecord } from "@/domain/models/MaintenanceRecord/MaintenanceRecord";
import { Equipment } from "@/domain/models/Equipment/Equipment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Plus, Trash2 } from "lucide-react";
import {
  deleteMaintenanceRecordAction,
  createMaintenanceRecordAction,
} from "@/application/actions/maintenanceRecord";
import { PermissionService } from "@/domain/services/PermissionService";
import { User } from "@/domain/models/User/User";
import { useState, useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: "GENERAL" | "EDITOR" | "ADMIN";
}

interface MaintenanceRecordListProps {
  maintenanceRecords: MaintenanceRecord[];
  equipmentId: string;
  equipment: Equipment;
  currentUser: CurrentUser | null;
}

export function MaintenanceRecordList({
  maintenanceRecords,
  equipmentId,
  equipment,
  currentUser,
}: MaintenanceRecordListProps) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const itemsPerPage = 10;
  const router = useRouter();

  // Check if current user can add maintenance records
  const canAddMaintenance =
    currentUser &&
    PermissionService.canEditEquipmentManagement(
      {
        id: currentUser.id,
        email: currentUser.email,
        name: currentUser.name,
        displayName: null,
        avatarUrl: null,
        phoneNumber: null,
        department: null,
        role: currentUser.role,
        passwordHash: "", // Not used for permission check
      } as User,
      equipment,
    );

  const [state, formAction, isPending] = useActionState(
    createMaintenanceRecordAction,
    null,
  );

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsCreateModalOpen(false);
      toast.success("Maintenance record added successfully");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state?.success, state?.error, router]);

  const handleSubmit = async (formData: FormData) => {
    await formAction(formData);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this maintenance record?")) {
      return;
    }

    setIsDeleting(id);
    const result = await deleteMaintenanceRecordAction(id, equipmentId);
    setIsDeleting(null);

    if (result.error) {
      toast.error(result.error);
    } else if (result.success) {
      toast.success("Maintenance record deleted successfully");
      router.refresh();
    }
  };

  const sortedRecords = [...maintenanceRecords].sort(
    (a, b) =>
      new Date(b.recordDate).getTime() - new Date(a.recordDate).getTime(),
  );

  // Pagination calculations
  const totalPages = Math.ceil(sortedRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = sortedRecords.slice(startIndex, endIndex);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
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
          <CardTitle>
            Maintenance History{" "}
            {sortedRecords.length > 0 && `(${sortedRecords.length})`}
          </CardTitle>
          <span className="text-sm text-gray-500">
            {isExpanded ? "▼" : "▶"}
          </span>
        </div>
        {canAddMaintenance && (
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add
          </Button>
        )}
      </CardHeader>
      {isExpanded && (
        <CardContent>
          {sortedRecords.length === 0 ? (
            <p className="text-gray-500">No maintenance records</p>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedRecords.map((record) => (
                  <div
                    key={record.id}
                    className="border rounded-lg p-4 hover:bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <p className="font-medium">
                            {format(new Date(record.recordDate), "yyyy/MM/dd", {
                              locale: ja,
                            })}
                          </p>
                          {record.cost && (
                            <span className="text-sm text-gray-600">
                              Cost: ¥{record.cost.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mb-2">
                          {record.description}
                        </p>
                        <p className="text-sm text-gray-500">
                          Performed by:{" "}
                          {record.performedByUser?.name || "Unknown"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(record.id)}
                        disabled={isDeleting === record.id}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    {startIndex + 1} -{" "}
                    {Math.min(endIndex, sortedRecords.length)} of{" "}
                    {sortedRecords.length} items
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
        </CardContent>
      )}

      {/* Create Maintenance Record Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Maintenance Record</DialogTitle>
          </DialogHeader>
          <form action={handleSubmit}>
            <input type="hidden" name="equipmentId" value={equipmentId} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recordDate">Record Date</Label>
                <Input
                  id="recordDate"
                  name="recordDate"
                  type="date"
                  required
                  defaultValue={format(new Date(), "yyyy-MM-dd")}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Enter maintenance description..."
                  required
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="cost">Cost (optional)</Label>
                <Input
                  id="cost"
                  name="cost"
                  type="number"
                  min="0"
                  placeholder="Enter cost in yen"
                />
              </div>
              {state?.error && (
                <div className="text-red-500 text-sm">{state.error}</div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Adding..." : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}

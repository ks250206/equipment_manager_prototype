"use client";

import { Equipment } from "@/domain/models/Equipment/Equipment";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateEquipmentManagementAction } from "@/application/actions/equipment";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FavoriteButton } from "./FavoriteButton";

interface UserSummary {
  id: string;
  name: string | null;
  email: string;
}

interface CurrentUser {
  id: string;
  email: string;
  name: string | null;
  role: "GENERAL" | "EDITOR" | "ADMIN";
}

interface EquipmentDetailProps {
  equipment: Equipment;
  users: UserSummary[];
  currentUser: CurrentUser | null;
  isFavorite: boolean;
}

const runningStateColors = {
  OPERATIONAL: "bg-green-500",
  MAINTENANCE: "bg-yellow-500",
  OUT_OF_SERVICE: "bg-red-500",
  RETIRED: "bg-gray-500",
};

const runningStateLabels = {
  OPERATIONAL: "Operational",
  MAINTENANCE: "Under Maintenance",
  OUT_OF_SERVICE: "Out of Service",
  RETIRED: "Retired",
};

export function EquipmentDetail({
  equipment,
  users,
  currentUser,
  isFavorite,
}: EquipmentDetailProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [administratorId, setAdministratorId] = useState<string | null>(
    equipment.administratorId,
  );
  const [viceAdministratorIds, setViceAdministratorIds] = useState<string[]>(
    equipment.viceAdministratorIds,
  );
  const [isPending, startTransition] = useTransition();

  // Check if current user can edit equipment management
  const canEdit =
    currentUser &&
    (currentUser.role === "ADMIN" ||
      currentUser.role === "EDITOR" ||
      equipment.administratorId === currentUser.id ||
      equipment.viceAdministratorIds.includes(currentUser.id));

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateEquipmentManagementAction(equipment.id, {
        administratorId,
        viceAdministratorIds,
      });

      if (result.success) {
        toast.success("Equipment updated successfully");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Failed to update equipment");
      }
    });
  };

  const toggleViceAdmin = (userId: string) => {
    setViceAdministratorIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <CardTitle>Equipment Information</CardTitle>
          {currentUser && (
            <FavoriteButton
              equipmentId={equipment.id}
              initialIsFavorite={isFavorite}
            />
          )}
        </div>
        {canEdit &&
          (!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Edit Administrators
            </Button>
          ) : (
            <div className="space-x-2">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isPending}>
                {isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          ))}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500">Equipment Name</p>
            <p className="text-lg">{equipment.name}</p>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-500">Running State</p>
            <Badge className={runningStateColors[equipment.runningState]}>
              {runningStateLabels[equipment.runningState]}
            </Badge>
          </div>

          {equipment.description && (
            <div className="col-span-2">
              <p className="text-sm font-medium text-gray-500">Description</p>
              <p>{equipment.description}</p>
            </div>
          )}

          {equipment.categoryMajor && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Major Category
              </p>
              <p>{equipment.categoryMajor}</p>
            </div>
          )}

          {equipment.categoryMinor && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Minor Category
              </p>
              <p>{equipment.categoryMinor}</p>
            </div>
          )}

          {equipment.installationDate && (
            <div>
              <p className="text-sm font-medium text-gray-500">
                Installation Date
              </p>
              <p>
                {format(new Date(equipment.installationDate), "yyyy年MM月dd日")}
              </p>
            </div>
          )}

          <div className="col-span-2 border-t pt-4">
            <h3 className="font-semibold mb-2">Management</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Administrator
                </p>
                {isEditing ? (
                  <Select
                    value={administratorId || "none"}
                    onValueChange={(val) =>
                      setAdministratorId(val === "none" ? null : val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Administrator" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name || user.email}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p>{equipment.administrator?.name || "Not set"}</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">
                  Vice Administrators
                </p>
                {isEditing ? (
                  <ScrollArea className="h-32 border rounded p-2">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={`vice-${user.id}`}
                            checked={viceAdministratorIds.includes(user.id)}
                            onCheckedChange={() => toggleViceAdmin(user.id)}
                          />
                          <Label htmlFor={`vice-${user.id}`}>
                            {user.name || user.email}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div>
                    {equipment.viceAdministrators &&
                    equipment.viceAdministrators.length > 0 ? (
                      <ul className="list-disc list-inside">
                        {equipment.viceAdministrators.map((vice) => (
                          <li key={vice.id}>{vice.name || "Unknown"}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>Not set</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

"use client";

import { useState, useActionState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  updateUserRoleAction,
  createUserAction,
  deleteUserAction,
} from "@/application/actions/user";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

type User = {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  department: string | null;
  role: "GENERAL" | "EDITOR" | "ADMIN";
};

type Props = {
  users: User[];
};

type ActionState = {
  error?: string;
  success?: boolean;
};

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

export default function UserManagement({ users }: Props) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedRole, setSelectedRole] = useState<
    "GENERAL" | "EDITOR" | "ADMIN"
  >("GENERAL");
  const [selectedDisplayName, setSelectedDisplayName] = useState<string>("");
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [newUserRole, setNewUserRole] = useState<
    "GENERAL" | "EDITOR" | "ADMIN"
  >("GENERAL");
  const [tempPassword, setTempPassword] = useState<string | null>(null);

  const [updateState, updateFormAction, isUpdating] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await updateUserRoleAction(formData);
      if (result.success) {
        toast.success("User updated successfully");
        setIsEditModalOpen(false);
        return { success: true, error: undefined };
      } else {
        toast.error(result.error || "Failed to update user");
        return {
          success: false,
          error: result.error || "Failed to update user",
        };
      }
    },
    initialState,
  );

  const [createState, createFormAction, isCreating] = useActionState(
    async (prevState: ActionState, formData: FormData) => {
      const result = await createUserAction(formData);
      if (result.success && result.data) {
        toast.success("User created successfully");
        setTempPassword(result.data.tempPassword);
        setIsCreateModalOpen(false);
        // Reload page to show new user
        window.location.reload();
        return { success: true, error: undefined };
      } else {
        toast.error(result.error || "Failed to create user");
        return {
          success: false,
          error: result.error || "Failed to create user",
        };
      }
    },
    initialState,
  );

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleDelete = async (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    const formData = new FormData();
    formData.append("userId", userToDelete.id);

    const result = await deleteUserAction(formData);
    if (result.success) {
      toast.success("User deleted successfully");
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      // Reload page to reflect changes
      window.location.reload();
    } else {
      toast.error(result.error || "Failed to delete user");
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setSelectedDisplayName(user.displayName || "");
    setSelectedPhoneNumber(user.phoneNumber || "");
    setSelectedDepartment(user.department || "");
    setIsEditModalOpen(true);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "ADMIN":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "EDITOR":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "GENERAL":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">User Management</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>Add User</Button>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Email</th>
              <th className="px-4 py-2 text-left">Department</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-t dark:border-gray-700">
                <td className="px-4 py-2">
                  <div className="flex items-center gap-2">
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.displayName || user.name || user.email}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                        {(user.displayName || user.name || user.email || "U")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-medium">
                        {user.displayName || user.name || "No name"}
                      </div>
                      {user.phoneNumber && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {user.phoneNumber}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-2">{user.email}</td>
                <td className="px-4 py-2">{user.department || "-"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-right">
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(user)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(user)}
                    >
                      Delete
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <form action={updateFormAction}>
            <input type="hidden" name="userId" value={selectedUser?.id || ""} />
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="user-email">Email</Label>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedUser?.email}
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={selectedDisplayName}
                  onChange={(e) => setSelectedDisplayName(e.target.value)}
                  placeholder="Display Name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={selectedPhoneNumber}
                  onChange={(e) => setSelectedPhoneNumber(e.target.value)}
                  placeholder="Phone Number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  placeholder="Department"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <input type="hidden" name="role" value={selectedRole} />
                <Select
                  value={selectedRole}
                  onValueChange={(value) =>
                    setSelectedRole(value as "GENERAL" | "EDITOR" | "ADMIN")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                    <SelectItem value="EDITOR">EDITOR</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {updateState?.error && (
                <div className="text-red-500 text-sm">{updateState.error}</div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Updating..." : "Update User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create User Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>
          <form action={createFormAction}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" placeholder="User Name" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Department"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-role">Role</Label>
                <input type="hidden" name="role" value={newUserRole} />
                <Select
                  value={newUserRole}
                  onValueChange={(value) =>
                    setNewUserRole(value as "GENERAL" | "EDITOR" | "ADMIN")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERAL">GENERAL</SelectItem>
                    <SelectItem value="EDITOR">EDITOR</SelectItem>
                    <SelectItem value="ADMIN">ADMIN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {createState?.error && (
                <div className="text-red-500 text-sm">{createState.error}</div>
              )}
              {tempPassword && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Temporary Password:
                  </p>
                  <p className="text-sm font-mono text-yellow-900 dark:text-yellow-100 mt-1">
                    {tempPassword}
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-2">
                    Please share this password with the user. They will be
                    required to change it on first login.
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsCreateModalOpen(false);
                  setTempPassword(null);
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating}>
                {isCreating ? "Creating..." : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Are you sure you want to delete this user? This action will:
            </p>
            <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 mb-4 space-y-1">
              <li>Remove the user from all equipment administrator roles</li>
              <li>
                Remove the user from all equipment vice administrator roles
              </li>
              <li>Keep existing reservations and maintenance records</li>
              <li>This action cannot be undone</li>
            </ul>
            <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
              <p className="text-sm font-medium">User to delete:</p>
              <p className="text-sm">
                {userToDelete?.displayName || userToDelete?.name || "No name"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userToDelete?.email}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteModalOpen(false);
                setUserToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { updateUserProfileAction } from "@/application/actions/user";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useActionState } from "react";

type UserProfile = {
  id: string;
  email: string;
  name: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  phoneNumber: string | null;
  department: string | null;
  role: string;
};

interface UserProfileManagerProps {
  user: UserProfile;
}

const initialState = {
  success: false,
  error: "",
};

export function UserProfileManager({ user }: UserProfileManagerProps) {
  const [state, formAction, isPending] = useActionState(
    async (
      prevState: { success: boolean; error: string },
      formData: FormData,
    ) => {
      const result = await updateUserProfileAction(formData);
      if (result.success) {
        return { success: true, error: "" };
      } else {
        return {
          success: false,
          error: result.error || "Failed to update profile",
        };
      }
    },
    initialState,
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your profile information here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                defaultValue={user.email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                defaultValue={user.name || ""}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Name is managed by the system administrator.
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                name="displayName"
                defaultValue={user.displayName || ""}
                placeholder="Enter your display name"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="department">Department</Label>
              <Input
                id="department"
                name="department"
                defaultValue={user.department || ""}
                placeholder="Enter your department"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                name="phoneNumber"
                defaultValue={user.phoneNumber || ""}
                placeholder="Enter your phone number"
              />
            </div>

            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}

            {state.success && (
              <p className="text-sm text-green-500">
                Profile updated successfully!
              </p>
            )}

            <div className="flex justify-end">
              <Button type="submit" disabled={isPending}>
                {isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

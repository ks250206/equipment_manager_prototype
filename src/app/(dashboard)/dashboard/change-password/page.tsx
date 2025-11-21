"use client";

import { useActionState } from "react";
import { useEffect } from "react";
import { changePasswordAction } from "@/application/actions/user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

type ActionState = {
  error?: string;
  success?: boolean;
  email?: string;
};

const initialState: ActionState = {
  error: undefined,
  success: undefined,
};

export default function ChangePasswordPage() {
  const [state, formAction, isPending] = useActionState(
    changePasswordAction,
    initialState,
  );

  useEffect(() => {
    if (state.error) {
      toast.error(state.error);
    } else if (state.success && state.email) {
      // Password change successful - session has been refreshed on the server
      // Just redirect to dashboard with a full page reload to ensure session is read
      toast.success("Password changed successfully");
      // Wait a bit to ensure the session cookie is set
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 300);
    }
  }, [state.success, state.error, state.email]);

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3rem)]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>
            Please change your password to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="newPassword">New Password *</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                minLength={6}
                placeholder="Enter new password"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                minLength={6}
                placeholder="Confirm new password"
              />
            </div>
            {state.error && (
              <p className="text-sm text-red-500">{state.error}</p>
            )}
            <div className="flex justify-end">
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

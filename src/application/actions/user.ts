"use server";

import { auth } from "@/auth";
import { DrizzleUserRepository } from "@/infrastructure/repositories/DrizzleUserRepository";
import { createUser } from "@/domain/models/User/User";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const userRepository = new DrizzleUserRepository();

const UpdateProfileSchema = z.object({
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
});

export async function getCurrentUserAction() {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr()) {
    return { success: false, error: "User not found" };
  }

  const user = userResult.value;
  if (!user) {
    return { success: false, error: "User not found" };
  }

  return {
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      department: user.department,
      role: user.role,
    },
  };
}

export async function updateUserProfileAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized" };
  }

  const userResult = await userRepository.findByEmail(session.user.email);
  if (userResult.isErr() || !userResult.value) {
    return { success: false, error: "User not found" };
  }

  const user = userResult.value;

  const rawData = {
    displayName: formData.get("displayName"),
    phoneNumber: formData.get("phoneNumber"),
    department: formData.get("department"),
  };

  const validatedFields = UpdateProfileSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  const { displayName, phoneNumber, department } = validatedFields.data;

  // Update user object with new values
  // Since User is immutable (readonly), we need to create a new object or use a method if available
  // But our factory creates a new object.
  // However, we need to keep existing values for other fields.

  // We can't just modify 'user' because it's readonly.
  // We need to reconstruct it.
  // But wait, our Factory 'createUser' takes all arguments.

  // Let's use the repository's update method which expects a User object.
  // We need to construct a new User object with updated fields.

  const updatedUser = {
    ...user,
    displayName: displayName || user.displayName,
    phoneNumber: phoneNumber || user.phoneNumber,
    department: department || user.department,
  };

  const updateResult = await userRepository.update(updatedUser);

  if (updateResult.isErr()) {
    return { success: false, error: "Failed to update profile" };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function getUsersAction() {
  const result = await userRepository.findAll();
  if (result.isErr()) {
    return [];
  }
  return result.value.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
  }));
}

const UpdateUserSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(["GENERAL", "EDITOR", "ADMIN"]),
  displayName: z.string().optional(),
  phoneNumber: z.string().optional(),
  department: z.string().optional(),
});

export async function getAllUsersAction() {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const result = await userRepository.findAll();
  if (result.isErr()) {
    return { success: false, error: "Failed to fetch users" };
  }

  return {
    success: true,
    data: result.value.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      phoneNumber: user.phoneNumber,
      department: user.department,
      role: user.role,
    })),
  };
}

export async function updateUserRoleAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    userId: formData.get("userId"),
    role: formData.get("role"),
    displayName: formData.get("displayName"),
    phoneNumber: formData.get("phoneNumber"),
    department: formData.get("department"),
  };

  const validatedFields = UpdateUserSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  const { userId, role, displayName, phoneNumber, department } =
    validatedFields.data;

  const userResult = await userRepository.findById(userId);
  if (userResult.isErr() || !userResult.value) {
    return { success: false, error: "User not found" };
  }

  const user = userResult.value;
  const updatedUser = {
    ...user,
    role,
    displayName: displayName !== undefined ? displayName : user.displayName,
    phoneNumber: phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
    department: department !== undefined ? department : user.department,
  };

  const updateResult = await userRepository.update(updatedUser);
  if (updateResult.isErr()) {
    return { success: false, error: "Failed to update user" };
  }

  revalidatePath("/users");
  return { success: true };
}

const DeleteUserSchema = z.object({
  userId: z.string().uuid(),
});

export async function deleteUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    userId: formData.get("userId"),
  };

  const validatedFields = DeleteUserSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  const { userId } = validatedFields.data;

  // Prevent deleting yourself
  if (userId === session.user.id) {
    return { success: false, error: "Cannot delete your own account" };
  }

  const userResult = await userRepository.findById(userId);
  if (userResult.isErr() || !userResult.value) {
    return { success: false, error: "User not found" };
  }

  // Perform soft delete
  const deleteResult = await userRepository.softDelete(userId);
  if (deleteResult.isErr()) {
    return { success: false, error: "Failed to delete user" };
  }

  revalidatePath("/users");
  revalidatePath("/equipments");
  return { success: true };
}

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().optional(),
  role: z.enum(["GENERAL", "EDITOR", "ADMIN"]).default("GENERAL"),
  department: z.string().optional(),
});

export async function createUserAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.role || session.user.role !== "ADMIN") {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    email: formData.get("email"),
    name: formData.get("name"),
    role: formData.get("role"),
    department: formData.get("department"),
  };

  const validatedFields = CreateUserSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return { success: false, error: "Invalid fields" };
  }

  const { email, name, role, department } = validatedFields.data;

  // Check if user already exists
  const existingUserResult = await userRepository.findByEmail(email);
  if (existingUserResult.isOk() && existingUserResult.value) {
    return { success: false, error: "User with this email already exists" };
  }

  // Generate temporary password
  const { v4: uuidv4 } = await import("uuid");
  const { hash } = await import("bcryptjs");
  const tempPassword = `temp${uuidv4().substring(0, 8)}`;
  const hashedPassword = await hash(tempPassword, 10);

  // Create user
  const userId = uuidv4();
  const userResult = createUser(
    userId,
    email,
    hashedPassword,
    name || null,
    role,
    null,
    null,
    null,
    department || null,
  );

  if (userResult.isErr()) {
    return { success: false, error: userResult.error.message };
  }

  const saveResult = await userRepository.save(userResult.value);
  if (saveResult.isErr()) {
    return { success: false, error: "Failed to create user" };
  }

  revalidatePath("/users");
  return {
    success: true,
    data: {
      userId: userId,
      tempPassword: tempPassword, // Return temp password to display to admin
    },
  };
}

const ChangePasswordSchema = z
  .object({
    currentPassword: z.string().optional(),
    newPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export async function changePasswordAction(
  prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const session = await auth();
  if (!session?.user?.email || !session.user.id) {
    return { error: "Unauthorized" };
  }

  const currentPasswordValue = formData.get("currentPassword");
  const newPasswordValue = formData.get("newPassword");
  const confirmPasswordValue = formData.get("confirmPassword");

  const rawData = {
    currentPassword:
      typeof currentPasswordValue === "string" &&
      currentPasswordValue.length > 0
        ? currentPasswordValue
        : undefined,
    newPassword: typeof newPasswordValue === "string" ? newPasswordValue : "",
    confirmPassword:
      typeof confirmPasswordValue === "string" ? confirmPasswordValue : "",
  };

  const validatedFields = ChangePasswordSchema.safeParse(rawData);
  if (!validatedFields.success) {
    // デバッグ: エラーの詳細を確認
    const firstIssue = validatedFields.error.issues[0];
    if (firstIssue) {
      return { error: firstIssue.message || "Invalid fields" };
    }
    return { error: "Invalid fields" };
  }

  const { currentPassword, newPassword } = validatedFields.data;

  try {
    // Get current user
    const userResult = await userRepository.findByEmail(session.user.email);
    if (userResult.isErr() || !userResult.value) {
      return { error: "User not found" };
    }

    const user = userResult.value;

    // Verify current password (if not first login)
    if (!session.user.mustChangePassword) {
      if (!currentPassword || currentPassword.length < 6) {
        return { error: "Current password is required" };
      }
      const { compare } = await import("bcryptjs");
      const passwordsMatch = await compare(currentPassword, user.passwordHash);
      if (!passwordsMatch) {
        return { error: "Current password is incorrect" };
      }
    }

    // Hash new password
    const { hash } = await import("bcryptjs");
    const hashedPassword = await hash(newPassword, 10);

    // Update password
    const updateResult = await userRepository.updatePassword(
      user.id,
      hashedPassword,
    );
    if (updateResult.isErr()) {
      return { error: "Failed to update password" };
    }

    // Refresh session by signing in again with the new password
    // This ensures the JWT token is updated with the new mustChangePassword flag
    const { signIn } = await import("@/auth");
    try {
      // Note: Server-side signIn may throw NEXT_REDIRECT error, which is expected
      // We'll catch it and treat it as success since the session was updated
      await signIn("credentials", {
        email: session.user.email,
        password: newPassword,
      });

      // If we reach here, signIn didn't redirect (unexpected but still success)
      revalidatePath("/profile");
      revalidatePath("/dashboard");
      revalidatePath("/users");
      return { success: true, email: session.user.email };
    } catch (error: unknown) {
      // Check if this is a redirect error (expected behavior - means signIn succeeded)
      if (error && typeof error === "object" && "digest" in error) {
        const digest = (error as { digest?: string }).digest;
        if (digest?.startsWith("NEXT_REDIRECT")) {
          // This is a redirect, which means signIn succeeded and session was updated
          // Revalidate paths and return success (don't re-throw to avoid issues with useActionState)
          revalidatePath("/profile");
          revalidatePath("/dashboard");
          revalidatePath("/users");
          return { success: true, email: session.user.email };
        }
      }

      // For other errors, log but still return success since password was updated
      console.error("Failed to refresh session after password change:", error);
      revalidatePath("/profile");
      revalidatePath("/dashboard");
      revalidatePath("/users");
      return { success: true, email: session.user.email };
    }
  } catch (error) {
    console.error("Failed to change password", error);
    return { error: "Failed to change password" };
  }
}

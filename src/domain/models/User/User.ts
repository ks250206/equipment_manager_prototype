import { Result, ok, err } from "neverthrow";
import { z } from "zod";

// Value Objects
export const UserIdSchema = z.string().uuid();
export type UserId = z.infer<typeof UserIdSchema>;

export const UserEmailSchema = z.string().email();
export type UserEmail = z.infer<typeof UserEmailSchema>;

export const UserRoleSchema = z.enum(["GENERAL", "EDITOR", "ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Entity
export type User = {
  readonly id: UserId;
  readonly email: UserEmail;
  readonly name: string | null;
  readonly displayName: string | null;
  readonly avatarUrl: string | null;
  readonly phoneNumber: string | null;
  readonly department: string | null;
  readonly role: UserRole;
  readonly passwordHash: string;
};

// Domain Errors
export class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DomainError";
  }
}

// Factory
export const createUser = (
  id: string,
  email: string,
  passwordHash: string,
  name: string | null = null,
  role: UserRole = "GENERAL",
  displayName: string | null = null,
  avatarUrl: string | null = null,
  phoneNumber: string | null = null,
  department: string | null = null,
): Result<User, DomainError> => {
  const idResult = UserIdSchema.safeParse(id);
  if (!idResult.success) return err(new DomainError("Invalid User ID"));

  const emailResult = UserEmailSchema.safeParse(email);
  if (!emailResult.success) return err(new DomainError("Invalid Email"));

  const roleResult = UserRoleSchema.safeParse(role);
  if (!roleResult.success) return err(new DomainError("Invalid Role"));

  return ok({
    id: idResult.data,
    email: emailResult.data,
    name,
    displayName,
    avatarUrl,
    phoneNumber,
    department,
    role: roleResult.data,
    passwordHash,
  });
};

import { describe, it, expect } from "vitest";
import { createUser, DomainError } from "./User";

describe("User Domain Model", () => {
  describe("createUser", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";
    const validEmail = "test@example.com";
    const validPasswordHash = "hashed_password_123";

    it("should create a valid user with all fields", () => {
      const result = createUser(
        validId,
        validEmail,
        validPasswordHash,
        "John Doe",
        "ADMIN",
        "Johnny",
        "https://example.com/avatar.jpg",
        "+1234567890",
        "Engineering",
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(validId);
        expect(result.value.email).toBe(validEmail);
        expect(result.value.passwordHash).toBe(validPasswordHash);
        expect(result.value.name).toBe("John Doe");
        expect(result.value.role).toBe("ADMIN");
        expect(result.value.displayName).toBe("Johnny");
        expect(result.value.avatarUrl).toBe("https://example.com/avatar.jpg");
        expect(result.value.phoneNumber).toBe("+1234567890");
        expect(result.value.department).toBe("Engineering");
      }
    });

    it("should create a valid user with default role GENERAL", () => {
      const result = createUser(validId, validEmail, validPasswordHash);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.role).toBe("GENERAL");
      }
    });

    it("should create a valid user with null optional fields", () => {
      const result = createUser(
        validId,
        validEmail,
        validPasswordHash,
        null,
        "GENERAL",
        null,
        null,
        null,
        null,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.name).toBeNull();
        expect(result.value.displayName).toBeNull();
        expect(result.value.avatarUrl).toBeNull();
        expect(result.value.phoneNumber).toBeNull();
        expect(result.value.department).toBeNull();
      }
    });

    it("should create a user with GENERAL role", () => {
      const result = createUser(
        validId,
        validEmail,
        validPasswordHash,
        null,
        "GENERAL",
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.role).toBe("GENERAL");
      }
    });

    it("should create a user with ADMIN role", () => {
      const result = createUser(
        validId,
        validEmail,
        validPasswordHash,
        null,
        "ADMIN",
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.role).toBe("ADMIN");
      }
    });

    it("should return error for invalid user ID (non-UUID)", () => {
      const invalidId = "not-a-uuid";

      const result = createUser(invalidId, validEmail, validPasswordHash);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.message).toBe("Invalid User ID");
      }
    });

    it("should return error for empty user ID", () => {
      const result = createUser("", validEmail, validPasswordHash);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.message).toBe("Invalid User ID");
      }
    });

    it("should return error for invalid email format", () => {
      const invalidEmail = "not-an-email";

      const result = createUser(validId, invalidEmail, validPasswordHash);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.message).toBe("Invalid Email");
      }
    });

    it("should return error for empty email", () => {
      const result = createUser(validId, "", validPasswordHash);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.message).toBe("Invalid Email");
      }
    });

    it("should return error for invalid role", () => {
      const result = createUser(
        validId,
        validEmail,
        validPasswordHash,
        null,
        "INVALID_ROLE" as any,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(DomainError);
        expect(result.error.message).toBe("Invalid Role");
      }
    });

    it("should verify structure of created user", () => {
      const result = createUser(
        validId,
        validEmail,
        validPasswordHash,
        "John Doe",
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: validId,
          email: validEmail,
          passwordHash: validPasswordHash,
          name: "John Doe",
          role: "GENERAL",
          displayName: null,
          avatarUrl: null,
          phoneNumber: null,
          department: null,
        });
      }
    });
  });
});

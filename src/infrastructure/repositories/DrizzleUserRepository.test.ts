import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleUserRepository } from "./DrizzleUserRepository";
import { createUser } from "@/domain/models/User/User";

vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    insert: vi.fn(),
    update: vi.fn(),
    select: vi.fn(),
    delete: vi.fn(),
    query: {
      users: {
        findFirst: vi.fn(),
        findMany: vi.fn(),
      },
    },
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  users: {
    id: "id",
    email: "email",
    password: "password",
    name: "name",
    displayName: "displayName",
    avatarUrl: "avatarUrl",
    phoneNumber: "phoneNumber",
    department: "department",
    role: "role",
    deletedAt: "deletedAt",
    $inferSelect: {} as unknown,
  },
  userFavoriteEquipments: {
    userId: "userId",
    equipmentId: "equipmentId",
  },
  equipment: {
    administratorId: "administratorId",
  },
  equipmentViceAdministrators: {
    userId: "userId",
    equipmentId: "equipmentId",
  },
}));

import { db } from "@/infrastructure/database/drizzle";

type MockBuilder<T> = {
  values: ReturnType<typeof vi.fn>;
  set: ReturnType<typeof vi.fn>;
  where: ReturnType<typeof vi.fn>;
  onConflictDoNothing: ReturnType<typeof vi.fn>;
  then: (resolve: (value: T) => void) => void;
};

const createMockBuilder = <T>(result: T): MockBuilder<T> => {
  const builder = {} as MockBuilder<T>;
  builder.values = vi.fn().mockReturnValue(builder);
  builder.set = vi.fn().mockReturnValue(builder);
  builder.where = vi.fn().mockResolvedValue(result);
  builder.onConflictDoNothing = vi.fn().mockResolvedValue(result);
  builder.then = (resolve: (value: T) => void) => resolve(result);
  return builder;
};

const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_EMAIL = "test@example.com";

describe("DrizzleUserRepository", () => {
  let repository: DrizzleUserRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleUserRepository();
  });

  describe("findById", () => {
    it("should return user when found", async () => {
      const mockData = {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        password: "hashed_password",
        name: "John Doe",
        displayName: "Johnny",
        avatarUrl: null,
        phoneNumber: null,
        department: null,
        role: "GENERAL",
      };

      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockData,
      );

      const result = await repository.findById(TEST_USER_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_USER_ID);
        expect(result.value?.email).toBe(TEST_EMAIL);
      }
    });

    it("should return null when user not found", async () => {
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await repository.findById(TEST_USER_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should return error when database query fails", async () => {
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await repository.findById(TEST_USER_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("findByEmail", () => {
    it("should return user when found by email", async () => {
      const mockData = {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        password: "hashed_password",
        name: "John Doe",
        displayName: null,
        avatarUrl: null,
        phoneNumber: null,
        department: null,
        role: "GENERAL",
      };

      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockData,
      );

      const result = await repository.findByEmail(TEST_EMAIL);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.email).toBe(TEST_EMAIL);
      }
    });

    it("should return null when user not found by email", async () => {
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        null,
      );

      const result = await repository.findByEmail(TEST_EMAIL);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should return error when database query fails", async () => {
      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await repository.findByEmail(TEST_EMAIL);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const mockData = [
        {
          id: TEST_USER_ID,
          email: TEST_EMAIL,
          password: "hashed_password",
          name: "John Doe",
          displayName: null,
          avatarUrl: null,
          phoneNumber: null,
          department: null,
          role: "GENERAL",
        },
        {
          id: "550e8400-e29b-41d4-a716-446655440003",
          email: "test2@example.com",
          password: "hashed_password2",
          name: "Jane Doe",
          displayName: null,
          avatarUrl: null,
          phoneNumber: null,
          department: null,
          role: "ADMIN",
        },
      ];

      (db.query.users.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockData,
      );

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].id).toBe(TEST_USER_ID);
        expect(result.value[1].id).toBe("550e8400-e29b-41d4-a716-446655440003");
      }
    });

    it("should return empty array when no users exist", async () => {
      (db.query.users.findMany as ReturnType<typeof vi.fn>).mockResolvedValue(
        [],
      );

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should return error when database query fails", async () => {
      (db.query.users.findMany as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await repository.findAll();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("save", () => {
    it("should save user successfully", async () => {
      const userResult = createUser(
        TEST_USER_ID,
        TEST_EMAIL,
        "hashed_password",
        "John Doe",
        "GENERAL",
      );
      if (userResult.isErr()) throw new Error("Failed to create user");

      // Mock select for checking existing users
      const selectBuilder = {
        from: vi.fn().mockResolvedValue([]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectBuilder);

      const builder = createMockBuilder(undefined);
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.save(userResult.value);

      expect(result.isOk()).toBe(true);
      expect(db.insert).toHaveBeenCalled();
      expect(builder.values).toHaveBeenCalledWith(
        expect.objectContaining({
          mustChangePassword: "true",
        }),
      );
    });

    it("should return error when save fails", async () => {
      const userResult = createUser(TEST_USER_ID, TEST_EMAIL, "password");
      if (userResult.isErr()) throw new Error("Failed to create user");

      // Mock select for checking existing users
      const selectBuilder = {
        from: vi.fn().mockResolvedValue([]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(selectBuilder);

      const builder = createMockBuilder(null);
      builder.values = vi.fn().mockRejectedValue(new Error("Save failed"));
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.save(userResult.value);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Save failed");
      }
    });
  });

  describe("update", () => {
    it("should update user successfully", async () => {
      const userResult = createUser(
        TEST_USER_ID,
        TEST_EMAIL,
        "hashed_password",
        "Updated Name",
        "ADMIN",
      );
      if (userResult.isErr()) throw new Error("Failed to create user");

      const builder = createMockBuilder(undefined);
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.update(userResult.value);

      expect(result.isOk()).toBe(true);
      expect(db.update).toHaveBeenCalled();
    });

    it("should return error when update fails", async () => {
      const userResult = createUser(TEST_USER_ID, TEST_EMAIL, "password");
      if (userResult.isErr()) throw new Error("Failed to create user");

      const builder = createMockBuilder(null);
      builder.set = vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Update failed")),
      });
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.update(userResult.value);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Update failed");
      }
    });
  });

  describe("updatePassword", () => {
    it("should update password successfully", async () => {
      const newPasswordHash = "new_hashed_password";
      const builder = createMockBuilder(undefined);
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.updatePassword(
        TEST_USER_ID,
        newPasswordHash,
      );

      expect(result.isOk()).toBe(true);
      expect(db.update).toHaveBeenCalled();
      expect(builder.set).toHaveBeenCalledWith({
        password: newPasswordHash,
        mustChangePassword: "false",
      });
    });

    it("should return error when update password fails", async () => {
      const newPasswordHash = "new_hashed_password";
      const builder = createMockBuilder(null);
      builder.set = vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Update password failed")),
      });
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.updatePassword(
        TEST_USER_ID,
        newPasswordHash,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Update password failed");
      }
    });
  });

  describe("mapToDomain", () => {
    it("should correctly map database row to domain entity", async () => {
      const mockData = {
        id: TEST_USER_ID,
        email: TEST_EMAIL,
        password: "hashed_password",
        name: "John Doe",
        displayName: "Johnny",
        avatarUrl: "https://example.com/avatar.jpg",
        phoneNumber: "+1234567890",
        department: "Engineering",
        role: "ADMIN",
      };

      (db.query.users.findFirst as ReturnType<typeof vi.fn>).mockResolvedValue(
        mockData,
      );

      const result = await repository.findById(TEST_USER_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk() && result.value) {
        expect(result.value.id).toBe(TEST_USER_ID);
        expect(result.value.email).toBe(TEST_EMAIL);
        expect(result.value.name).toBe("John Doe");
        expect(result.value.displayName).toBe("Johnny");
        expect(result.value.avatarUrl).toBe("https://example.com/avatar.jpg");
        expect(result.value.phoneNumber).toBe("+1234567890");
        expect(result.value.department).toBe("Engineering");
        expect(result.value.role).toBe("ADMIN");
      }
    });
  });

  describe("addFavorite", () => {
    it("should add favorite equipment successfully", async () => {
      const equipmentId = "550e8400-e29b-41d4-a716-446655440002";
      const builder = createMockBuilder(undefined);
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.addFavorite(TEST_USER_ID, equipmentId);

      expect(result.isOk()).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should return error when add favorite fails", async () => {
      const equipmentId = "550e8400-e29b-41d4-a716-446655440002";
      const builder = createMockBuilder(null);
      builder.values = vi.fn().mockReturnValue(builder);
      builder.onConflictDoNothing = vi
        .fn()
        .mockRejectedValue(new Error("Add favorite failed"));
      (db.insert as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.addFavorite(TEST_USER_ID, equipmentId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Add favorite failed");
      }
    });
  });

  describe("removeFavorite", () => {
    it("should remove favorite equipment successfully", async () => {
      const equipmentId = "550e8400-e29b-41d4-a716-446655440002";
      const builder = createMockBuilder(undefined);
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.removeFavorite(TEST_USER_ID, equipmentId);

      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });

    it("should return error when remove favorite fails", async () => {
      const equipmentId = "550e8400-e29b-41d4-a716-446655440002";
      const builder = createMockBuilder(null);
      builder.where = vi
        .fn()
        .mockRejectedValue(new Error("Remove favorite failed"));
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.removeFavorite(TEST_USER_ID, equipmentId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Remove favorite failed");
      }
    });
  });

  describe("getFavorites", () => {
    it("should return favorite equipment IDs", async () => {
      const mockData = [
        { equipmentId: "550e8400-e29b-41d4-a716-446655440002" },
        { equipmentId: "550e8400-e29b-41d4-a716-446655440003" },
      ];

      type SelectBuilder = {
        from: ReturnType<typeof vi.fn>;
        where: ReturnType<typeof vi.fn>;
        then: (resolve: (value: typeof mockData) => void) => void;
      };
      const builder: SelectBuilder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockData),
        then: (resolve: (value: typeof mockData) => void) => resolve(mockData),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.getFavorites(TEST_USER_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toBe("550e8400-e29b-41d4-a716-446655440002");
      }
    });

    it("should return empty array when user has no favorites", async () => {
      type SelectBuilder = {
        from: ReturnType<typeof vi.fn>;
        where: ReturnType<typeof vi.fn>;
        then: (resolve: (value: unknown[]) => void) => void;
      };
      const builder: SelectBuilder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        then: (resolve: (value: unknown[]) => void) => resolve([]),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.getFavorites(TEST_USER_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should return error when query fails", async () => {
      type SelectBuilder = {
        from: ReturnType<typeof vi.fn>;
        where: ReturnType<typeof vi.fn>;
      };
      const builder: SelectBuilder = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      (db.select as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.getFavorites(TEST_USER_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("softDelete", () => {
    it("should soft delete user successfully", async () => {
      const updateBuilder = createMockBuilder(undefined);
      type DeleteBuilder = {
        where: ReturnType<typeof vi.fn>;
        then: (resolve: (value: undefined) => void) => void;
      };
      const deleteBuilder: DeleteBuilder = {
        where: vi.fn().mockResolvedValue(undefined),
        then: (resolve: (value: undefined) => void) => resolve(undefined),
      };

      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(updateBuilder);
      (db.delete as ReturnType<typeof vi.fn>).mockReturnValue(deleteBuilder);

      const result = await repository.softDelete(TEST_USER_ID);

      expect(result.isOk()).toBe(true);
      expect(db.update).toHaveBeenCalledTimes(2); // Once for user, once for equipment
      expect(db.delete).toHaveBeenCalled();
    });

    it("should return error when soft delete fails", async () => {
      const builder = createMockBuilder(null);
      builder.set = vi.fn().mockReturnValue({
        where: vi.fn().mockRejectedValue(new Error("Soft delete failed")),
      });
      (db.update as ReturnType<typeof vi.fn>).mockReturnValue(builder);

      const result = await repository.softDelete(TEST_USER_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Soft delete failed");
      }
    });
  });
});

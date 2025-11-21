import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleBuildingRepository } from "./DrizzleBuildingRepository";
import { createBuilding } from "@/domain/models/Building/Building";

// Mock the database module
vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      buildings: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  buildings: {
    id: "id",
    name: "name",
    address: "address",
  },
}));

import { db } from "@/infrastructure/database/drizzle";

// Helper to create chainable mock builder
const createMockBuilder = (result: any) => {
  const builder: any = {};
  builder.from = vi.fn().mockReturnValue(builder);
  builder.where = vi.fn().mockReturnValue(builder);
  builder.values = vi.fn().mockReturnValue(builder);
  builder.onConflictDoUpdate = vi.fn().mockResolvedValue(result);
  builder.then = (resolve: any) => resolve(result);
  return builder;
};

const TEST_BUILDING_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_BUILDING_ID_2 = "550e8400-e29b-41d4-a716-446655440001";

describe("DrizzleBuildingRepository", () => {
  let repository: DrizzleBuildingRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleBuildingRepository();
  });

  describe("findAll", () => {
    it("should return all buildings", async () => {
      const mockData = [
        {
          id: TEST_BUILDING_ID,
          name: "Main Building",
          address: "123 Main St",
        },
        {
          id: TEST_BUILDING_ID_2,
          name: "Annex Building",
          address: "456 Side St",
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0].id).toBe(TEST_BUILDING_ID);
        expect(result.value[0].name).toBe("Main Building");
        expect(result.value[0].address).toBe("123 Main St");
        expect(result.value[1].id).toBe(TEST_BUILDING_ID_2);
      }
    });

    it("should return empty array when no buildings exist", async () => {
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should return error when database query fails", async () => {
      const builder = createMockBuilder(null);
      builder.from = vi.fn().mockRejectedValue(new Error("Database error"));
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("findById", () => {
    it("should return building when found", async () => {
      const mockData = {
        id: TEST_BUILDING_ID,
        name: "Main Building",
        address: "123 Main St",
      };

      (db.query.buildings.findFirst as any).mockResolvedValue(mockData);

      const result = await repository.findById(TEST_BUILDING_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_BUILDING_ID);
        expect(result.value?.name).toBe("Main Building");
      }
    });

    it("should return null when building not found", async () => {
      (db.query.buildings.findFirst as any).mockResolvedValue(null);

      const result = await repository.findById(TEST_BUILDING_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should return error when database query fails", async () => {
      (db.query.buildings.findFirst as any).mockRejectedValue(
        new Error("Database error"),
      );

      const result = await repository.findById(TEST_BUILDING_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });
  });

  describe("save", () => {
    it("should save building successfully", async () => {
      const buildingResult = createBuilding(
        TEST_BUILDING_ID,
        "New Building",
        "789 New St",
      );

      if (buildingResult.isErr()) {
        throw new Error("Failed to create building");
      }

      const building = buildingResult.value;
      const builder = createMockBuilder(undefined);
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(building);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual(building);
      }
      expect(db.insert).toHaveBeenCalled();
    });

    it("should return error when save fails", async () => {
      const buildingResult = createBuilding(TEST_BUILDING_ID, "Building", null);
      if (buildingResult.isErr()) throw new Error("Failed to create building");

      const builder = {
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockRejectedValue(new Error("Save failed")),
      };
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(buildingResult.value);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Save failed");
      }
    });
  });

  describe("delete", () => {
    it("should delete building successfully", async () => {
      const builder = createMockBuilder(undefined);
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_BUILDING_ID);

      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });

    it("should return error when delete fails", async () => {
      const builder = createMockBuilder(null);
      builder.where = vi.fn().mockRejectedValue(new Error("Delete failed"));
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_BUILDING_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Delete failed");
      }
    });
  });
});

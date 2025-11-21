import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleFloorRepository } from "./DrizzleFloorRepository";
import { createFloor } from "@/domain/models/Floor/Floor";

vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      floors: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  floors: {
    id: "id",
    name: "name",
    buildingId: "buildingId",
    floorNumber: "floorNumber",
  },
}));

import { db } from "@/infrastructure/database/drizzle";

const createMockBuilder = (result: any) => {
  const builder: any = {};
  builder.from = vi.fn().mockReturnValue(builder);
  builder.where = vi.fn().mockReturnValue(builder);
  builder.values = vi.fn().mockReturnValue(builder);
  builder.onConflictDoUpdate = vi.fn().mockResolvedValue(result);
  builder.then = (resolve: any) => resolve(result);
  return builder;
};

const TEST_FLOOR_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_BUILDING_ID = "550e8400-e29b-41d4-a716-446655440001";

describe("DrizzleFloorRepository", () => {
  let repository: DrizzleFloorRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleFloorRepository();
  });

  describe("findAll", () => {
    it("should return all floors", async () => {
      const mockData = [
        {
          id: TEST_FLOOR_ID,
          name: "1st Floor",
          buildingId: TEST_BUILDING_ID,
          floorNumber: 1,
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(TEST_FLOOR_ID);
        expect(result.value[0].name).toBe("1st Floor");
      }
    });

    it("should return empty array when no floors exist", async () => {
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("findById", () => {
    it("should return floor when found", async () => {
      const mockData = {
        id: TEST_FLOOR_ID,
        name: "1st Floor",
        buildingId: TEST_BUILDING_ID,
        floorNumber: 1,
      };

      (db.query.floors.findFirst as any).mockResolvedValue(mockData);

      const result = await repository.findById(TEST_FLOOR_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_FLOOR_ID);
      }
    });

    it("should return null when floor not found", async () => {
      (db.query.floors.findFirst as any).mockResolvedValue(null);

      const result = await repository.findById(TEST_FLOOR_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("findByBuildingId", () => {
    it("should return floors for a building", async () => {
      const mockData = [
        {
          id: TEST_FLOOR_ID,
          name: "1st Floor",
          buildingId: TEST_BUILDING_ID,
          floorNumber: 1,
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByBuildingId(TEST_BUILDING_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].buildingId).toBe(TEST_BUILDING_ID);
      }
    });

    it("should return empty array when no floors found for building", async () => {
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByBuildingId(TEST_BUILDING_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("save", () => {
    it("should save floor successfully", async () => {
      const floorResult = createFloor(
        TEST_FLOOR_ID,
        "2nd Floor",
        TEST_BUILDING_ID,
        2,
      );
      if (floorResult.isErr()) throw new Error("Failed to create floor");

      const builder = createMockBuilder(undefined);
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(floorResult.value);

      expect(result.isOk()).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete floor successfully", async () => {
      const builder = createMockBuilder(undefined);
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_FLOOR_ID);

      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});

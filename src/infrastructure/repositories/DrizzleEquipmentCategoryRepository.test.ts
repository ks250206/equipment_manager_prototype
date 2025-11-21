import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleEquipmentCategoryRepository } from "./DrizzleEquipmentCategoryRepository";
import { createEquipmentCategory } from "@/domain/models/Equipment/EquipmentCategory";

vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      equipmentCategories: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  equipmentCategories: {
    id: "id",
    categoryMajor: "categoryMajor",
    categoryMinor: "categoryMinor",
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

const TEST_CATEGORY_ID = "550e8400-e29b-41d4-a716-446655440000";

describe("DrizzleEquipmentCategoryRepository", () => {
  let repository: DrizzleEquipmentCategoryRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleEquipmentCategoryRepository();
  });

  describe("findAll", () => {
    it("should return all equipment categories", async () => {
      const mockData = [
        {
          id: TEST_CATEGORY_ID,
          categoryMajor: "Audio/Visual",
          categoryMinor: "Projector",
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(TEST_CATEGORY_ID);
        expect(result.value[0].categoryMajor).toBe("Audio/Visual");
        expect(result.value[0].categoryMinor).toBe("Projector");
      }
    });

    it("should return empty array when no categories exist", async () => {
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
    it("should return category when found", async () => {
      const mockData = {
        id: TEST_CATEGORY_ID,
        categoryMajor: "Audio/Visual",
        categoryMinor: "Projector",
      };

      (db.query.equipmentCategories.findFirst as any).mockResolvedValue(
        mockData,
      );

      const result = await repository.findById(TEST_CATEGORY_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_CATEGORY_ID);
      }
    });

    it("should return null when category not found", async () => {
      (db.query.equipmentCategories.findFirst as any).mockResolvedValue(null);

      const result = await repository.findById(TEST_CATEGORY_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("save", () => {
    it("should save equipment category successfully", async () => {
      const categoryResult = createEquipmentCategory(
        TEST_CATEGORY_ID,
        "IT Equipment",
        "Laptop",
      );
      if (categoryResult.isErr()) throw new Error("Failed to create category");

      const builder = createMockBuilder(undefined);
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(categoryResult.value);

      expect(result.isOk()).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete equipment category successfully", async () => {
      const builder = createMockBuilder(undefined);
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_CATEGORY_ID);

      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});

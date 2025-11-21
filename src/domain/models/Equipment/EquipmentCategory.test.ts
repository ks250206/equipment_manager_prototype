import { describe, it, expect } from "vitest";
import {
  createEquipmentCategory,
  EquipmentCategoryError,
} from "./EquipmentCategory";

describe("EquipmentCategory Domain Model", () => {
  describe("createEquipmentCategory", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";
    const validMajor = "Audio/Visual";
    const validMinor = "Projector";

    it("should create a valid equipment category with all fields", () => {
      const result = createEquipmentCategory(validId, validMajor, validMinor);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(validId);
        expect(result.value.categoryMajor).toBe(validMajor);
        expect(result.value.categoryMinor).toBe(validMinor);
      }
    });

    it("should create a valid category with different major/minor combinations", () => {
      const result = createEquipmentCategory(validId, "IT Equipment", "Laptop");

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.categoryMajor).toBe("IT Equipment");
        expect(result.value.categoryMinor).toBe("Laptop");
      }
    });

    it("should return error for invalid category ID (non-UUID)", () => {
      const invalidId = "not-a-uuid";

      const result = createEquipmentCategory(invalidId, validMajor, validMinor);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(EquipmentCategoryError);
        expect(result.error.message).toBe("Invalid Category ID");
      }
    });

    it("should return error for empty category ID", () => {
      const result = createEquipmentCategory("", validMajor, validMinor);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(EquipmentCategoryError);
        expect(result.error.message).toBe("Invalid Category ID");
      }
    });

    it("should return error for invalid category major (empty string)", () => {
      const invalidMajor = "";

      const result = createEquipmentCategory(validId, invalidMajor, validMinor);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(EquipmentCategoryError);
        expect(result.error.message).toBe("Invalid Category Major");
      }
    });

    it("should return error for invalid category minor (empty string)", () => {
      const invalidMinor = "";

      const result = createEquipmentCategory(validId, validMajor, invalidMinor);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(EquipmentCategoryError);
        expect(result.error.message).toBe("Invalid Category Minor");
      }
    });

    it("should verify structure of created equipment category", () => {
      const result = createEquipmentCategory(validId, validMajor, validMinor);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: validId,
          categoryMajor: validMajor,
          categoryMinor: validMinor,
        });
      }
    });
  });
});

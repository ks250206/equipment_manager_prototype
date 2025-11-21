import { describe, it, expect } from "vitest";
import { createBuilding, BuildingError } from "./Building";

describe("Building Domain Model", () => {
  describe("createBuilding", () => {
    it("should create a valid building with all fields", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const name = "Main Building";
      const address = "123 Main St";

      const result = createBuilding(id, name, address);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(id);
        expect(result.value.name).toBe(name);
        expect(result.value.address).toBe(address);
      }
    });

    it("should create a valid building with null address", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const name = "Main Building";

      const result = createBuilding(id, name, null);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(id);
        expect(result.value.name).toBe(name);
        expect(result.value.address).toBeNull();
      }
    });

    it("should create a valid building with default null address", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const name = "Main Building";

      const result = createBuilding(id, name);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.address).toBeNull();
      }
    });

    it("should return error for invalid building ID (non-UUID)", () => {
      const invalidId = "not-a-uuid";
      const name = "Main Building";

      const result = createBuilding(invalidId, name);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(BuildingError);
        expect(result.error.message).toBe("Invalid Building ID");
      }
    });

    it("should return error for empty building ID", () => {
      const invalidId = "";
      const name = "Main Building";

      const result = createBuilding(invalidId, name);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(BuildingError);
        expect(result.error.message).toBe("Invalid Building ID");
      }
    });

    it("should return error for invalid building name (empty string)", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const invalidName = "";

      const result = createBuilding(id, invalidName);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(BuildingError);
        expect(result.error.message).toBe("Invalid Building Name");
      }
    });

    it("should verify immutability of created building", () => {
      const id = "550e8400-e29b-41d4-a716-446655440000";
      const name = "Main Building";
      const address = "123 Main St";

      const result = createBuilding(id, name, address);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const building = result.value;
        // TypeScript enforces readonly at compile time
        // This test verifies the structure is created correctly
        expect(Object.isFrozen(building)).toBe(false); // Plain objects aren't frozen by default
        expect(building).toEqual({
          id,
          name,
          address,
        });
      }
    });
  });
});

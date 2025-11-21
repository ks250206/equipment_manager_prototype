import { describe, it, expect } from "vitest";
import { createFloor, FloorError } from "./Floor";

describe("Floor Domain Model", () => {
  describe("createFloor", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";
    const validBuildingId = "550e8400-e29b-41d4-a716-446655440001";
    const validName = "1st Floor";

    it("should create a valid floor with all fields", () => {
      const floorNumber = 1;

      const result = createFloor(
        validId,
        validName,
        validBuildingId,
        floorNumber,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(validId);
        expect(result.value.name).toBe(validName);
        expect(result.value.buildingId).toBe(validBuildingId);
        expect(result.value.floorNumber).toBe(floorNumber);
      }
    });

    it("should create a valid floor with null floor number", () => {
      const result = createFloor(validId, validName, validBuildingId, null);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.floorNumber).toBeNull();
      }
    });

    it("should create a valid floor with default null floor number", () => {
      const result = createFloor(validId, validName, validBuildingId);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.floorNumber).toBeNull();
      }
    });

    it("should create a valid floor with negative floor number (basement)", () => {
      const result = createFloor(validId, "Basement", validBuildingId, -1);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.floorNumber).toBe(-1);
      }
    });

    it("should create a valid floor with zero floor number (ground floor)", () => {
      const result = createFloor(validId, "Ground Floor", validBuildingId, 0);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.floorNumber).toBe(0);
      }
    });

    it("should return error for invalid floor ID (non-UUID)", () => {
      const invalidId = "not-a-uuid";

      const result = createFloor(invalidId, validName, validBuildingId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(FloorError);
        expect(result.error.message).toBe("Invalid Floor ID");
      }
    });

    it("should return error for empty floor ID", () => {
      const result = createFloor("", validName, validBuildingId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(FloorError);
        expect(result.error.message).toBe("Invalid Floor ID");
      }
    });

    it("should return error for invalid floor name (empty string)", () => {
      const invalidName = "";

      const result = createFloor(validId, invalidName, validBuildingId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(FloorError);
        expect(result.error.message).toBe("Invalid Floor Name");
      }
    });

    it("should return error for invalid building ID (non-UUID)", () => {
      const invalidBuildingId = "not-a-uuid";

      const result = createFloor(validId, validName, invalidBuildingId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(FloorError);
        expect(result.error.message).toBe("Invalid Building ID");
      }
    });

    it("should return error for empty building ID", () => {
      const result = createFloor(validId, validName, "");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(FloorError);
        expect(result.error.message).toBe("Invalid Building ID");
      }
    });

    it("should verify structure of created floor", () => {
      const result = createFloor(validId, validName, validBuildingId, 5);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: validId,
          name: validName,
          buildingId: validBuildingId,
          floorNumber: 5,
        });
      }
    });
  });
});

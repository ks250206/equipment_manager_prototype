import { describe, it, expect } from "vitest";
import { createRoom, RoomError } from "./Room";

describe("Room Domain Model", () => {
  describe("createRoom", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";
    const validFloorId = "550e8400-e29b-41d4-a716-446655440001";
    const validName = "Conference Room A";

    it("should create a valid room with all fields", () => {
      const capacity = 20;

      const result = createRoom(validId, validName, validFloorId, capacity);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(validId);
        expect(result.value.name).toBe(validName);
        expect(result.value.floorId).toBe(validFloorId);
        expect(result.value.capacity).toBe(capacity);
      }
    });

    it("should create a valid room with null capacity", () => {
      const result = createRoom(validId, validName, validFloorId, null);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.capacity).toBeNull();
      }
    });

    it("should create a valid room with default null capacity", () => {
      const result = createRoom(validId, validName, validFloorId);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.capacity).toBeNull();
      }
    });

    it("should create a valid room with zero capacity", () => {
      const result = createRoom(validId, validName, validFloorId, 0);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.capacity).toBe(0);
      }
    });

    it("should create a valid room with large capacity", () => {
      const result = createRoom(validId, "Auditorium", validFloorId, 500);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.capacity).toBe(500);
      }
    });

    it("should return error for invalid room ID (non-UUID)", () => {
      const invalidId = "not-a-uuid";

      const result = createRoom(invalidId, validName, validFloorId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(RoomError);
        expect(result.error.message).toBe("Invalid Room ID");
      }
    });

    it("should return error for empty room ID", () => {
      const result = createRoom("", validName, validFloorId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(RoomError);
        expect(result.error.message).toBe("Invalid Room ID");
      }
    });

    it("should return error for invalid room name (empty string)", () => {
      const invalidName = "";

      const result = createRoom(validId, invalidName, validFloorId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(RoomError);
        expect(result.error.message).toBe("Invalid Room Name");
      }
    });

    it("should return error for invalid floor ID (non-UUID)", () => {
      const invalidFloorId = "not-a-uuid";

      const result = createRoom(validId, validName, invalidFloorId);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(RoomError);
        expect(result.error.message).toBe("Invalid Floor ID");
      }
    });

    it("should return error for empty floor ID", () => {
      const result = createRoom(validId, validName, "");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(RoomError);
        expect(result.error.message).toBe("Invalid Floor ID");
      }
    });

    it("should verify structure of created room", () => {
      const result = createRoom(validId, validName, validFloorId, 15);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toEqual({
          id: validId,
          name: validName,
          floorId: validFloorId,
          capacity: 15,
        });
      }
    });
  });
});

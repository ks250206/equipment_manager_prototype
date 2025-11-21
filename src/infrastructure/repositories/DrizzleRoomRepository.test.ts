import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleRoomRepository } from "./DrizzleRoomRepository";
import { createRoom } from "@/domain/models/Room/Room";

vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    query: {
      rooms: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  rooms: {
    id: "id",
    name: "name",
    floorId: "floorId",
    capacity: "capacity",
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

const TEST_ROOM_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_FLOOR_ID = "550e8400-e29b-41d4-a716-446655440001";

describe("DrizzleRoomRepository", () => {
  let repository: DrizzleRoomRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleRoomRepository();
  });

  describe("findAll", () => {
    it("should return all rooms", async () => {
      const mockData = [
        {
          id: TEST_ROOM_ID,
          name: "Conference Room A",
          floorId: TEST_FLOOR_ID,
          capacity: 20,
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(TEST_ROOM_ID);
        expect(result.value[0].name).toBe("Conference Room A");
      }
    });

    it("should return empty array when no rooms exist", async () => {
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
    it("should return room when found", async () => {
      const mockData = {
        id: TEST_ROOM_ID,
        name: "Conference Room A",
        floorId: TEST_FLOOR_ID,
        capacity: 20,
      };

      (db.query.rooms.findFirst as any).mockResolvedValue(mockData);

      const result = await repository.findById(TEST_ROOM_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_ROOM_ID);
      }
    });

    it("should return null when room not found", async () => {
      (db.query.rooms.findFirst as any).mockResolvedValue(null);

      const result = await repository.findById(TEST_ROOM_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("findByFloorId", () => {
    it("should return rooms for a floor", async () => {
      const mockData = [
        {
          id: TEST_ROOM_ID,
          name: "Conference Room A",
          floorId: TEST_FLOOR_ID,
          capacity: 20,
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByFloorId(TEST_FLOOR_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].floorId).toBe(TEST_FLOOR_ID);
      }
    });

    it("should return empty array when no rooms found for floor", async () => {
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByFloorId(TEST_FLOOR_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("save", () => {
    it("should save room successfully", async () => {
      const roomResult = createRoom(
        TEST_ROOM_ID,
        "Meeting Room",
        TEST_FLOOR_ID,
        10,
      );
      if (roomResult.isErr()) throw new Error("Failed to create room");

      const builder = createMockBuilder(undefined);
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(roomResult.value);

      expect(result.isOk()).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });
  });

  describe("delete", () => {
    it("should delete room successfully", async () => {
      const builder = createMockBuilder(undefined);
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_ROOM_ID);

      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});

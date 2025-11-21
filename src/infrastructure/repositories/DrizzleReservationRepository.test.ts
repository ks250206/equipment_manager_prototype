import { describe, it, expect, vi, beforeEach } from "vitest";
import { DrizzleReservationRepository } from "./DrizzleReservationRepository";
import { createReservation } from "@/domain/models/Reservation/Reservation";

vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    select: vi.fn(),
    selectDistinct: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  reservations: {
    id: "id",
    startTime: "startTime",
    endTime: "endTime",
    comment: "comment",
    userId: "userId",
    equipmentId: "equipmentId",
  },
  users: {
    id: "id",
    name: "name",
  },
  equipment: {
    id: "id",
    name: "name",
  },
}));

import { db } from "@/infrastructure/database/drizzle";

const createMockBuilder = (
  result: any,
  shouldReject: boolean = false,
  rejectError?: Error,
) => {
  const builder: any = {};
  builder.from = vi.fn().mockReturnValue(builder);
  builder.innerJoin = vi.fn().mockReturnValue(builder);
  builder.where = vi.fn().mockReturnValue(builder);
  builder.values = vi.fn().mockReturnValue(builder);
  builder.onConflictDoUpdate = vi.fn().mockResolvedValue(result);
  if (shouldReject && rejectError) {
    builder.then = (onResolve: any, onReject: any) => {
      if (onReject) {
        return Promise.reject(rejectError).catch(onReject);
      }
      return Promise.reject(rejectError);
    };
  } else {
    builder.then = (resolve: any) => resolve(result);
  }
  return builder;
};

const TEST_RESERVATION_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_USER_ID = "550e8400-e29b-41d4-a716-446655440001";
const TEST_EQUIPMENT_ID = "550e8400-e29b-41d4-a716-446655440002";

describe("DrizzleReservationRepository", () => {
  let repository: DrizzleReservationRepository;

  beforeEach(() => {
    vi.clearAllMocks();
    repository = new DrizzleReservationRepository();
  });

  describe("findAll", () => {
    it("should return all reservations with joined data", async () => {
      const mockData = [
        {
          reservation: {
            id: TEST_RESERVATION_ID,
            startTime: new Date("2024-01-01T10:00:00Z"),
            endTime: new Date("2024-01-01T11:00:00Z"),
            comment: "Team meeting",
            userId: TEST_USER_ID,
            equipmentId: TEST_EQUIPMENT_ID,
          },
          user: {
            id: TEST_USER_ID,
            name: "John Doe",
          },
          equipment: {
            id: TEST_EQUIPMENT_ID,
            name: "Projector",
          },
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(TEST_RESERVATION_ID);
        expect(result.value[0].comment).toBe("Team meeting");
        expect(result.value[0].booker?.name).toBe("John Doe");
        expect(result.value[0].equipment?.name).toBe("Projector");
      }
    });

    it("should return empty array when no reservations exist", async () => {
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should return error when database query fails", async () => {
      const error = new Error("Database error");
      // Create a builder that rejects when awaited
      const builder: any = createMockBuilder([]);
      // Override then to reject
      builder.then = vi.fn((onResolve: any, onReject: any) => {
        if (onReject) {
          return Promise.reject(error).catch(onReject);
        }
        return Promise.reject(error);
      });
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe("Database error");
      }
    });

    it("should return error when createReservation fails", async () => {
      const mockData = [
        {
          reservation: {
            id: "invalid-id", // Invalid UUID will cause createReservation to fail
            startTime: new Date("2024-01-01T10:00:00Z"),
            endTime: new Date("2024-01-01T11:00:00Z"),
            comment: "Team meeting",
            userId: TEST_USER_ID,
            equipmentId: TEST_EQUIPMENT_ID,
          },
          user: {
            id: TEST_USER_ID,
            name: "John Doe",
          },
          equipment: {
            id: TEST_EQUIPMENT_ID,
            name: "Projector",
          },
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findAll();

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("findById", () => {
    it("should return reservation with booker and equipment details", async () => {
      const mockData = [
        {
          reservation: {
            id: TEST_RESERVATION_ID,
            startTime: new Date("2024-01-01T10:00:00Z"),
            endTime: new Date("2024-01-01T11:00:00Z"),
            comment: "Meeting",
            userId: TEST_USER_ID,
            equipmentId: TEST_EQUIPMENT_ID,
          },
          user: {
            id: TEST_USER_ID,
            name: "John Doe",
          },
          equipment: {
            id: TEST_EQUIPMENT_ID,
            name: "Projector",
          },
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findById(TEST_RESERVATION_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_RESERVATION_ID);
        expect(result.value?.booker).toBeDefined();
        expect(result.value?.equipment).toBeDefined();
      }
    });

    it("should return null when reservation not found", async () => {
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findById(TEST_RESERVATION_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });

    it("should return error when database query fails", async () => {
      const builder: any = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findById(TEST_RESERVATION_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
      }
    });

    it("should return error when createReservation fails in findById", async () => {
      const mockData = [
        {
          reservation: {
            id: "invalid-id", // Invalid UUID will cause createReservation to fail
            startTime: new Date("2024-01-01T10:00:00Z"),
            endTime: new Date("2024-01-01T11:00:00Z"),
            comment: "Meeting",
            userId: TEST_USER_ID,
            equipmentId: TEST_EQUIPMENT_ID,
          },
          user: {
            id: TEST_USER_ID,
            name: "John Doe",
          },
          equipment: {
            id: TEST_EQUIPMENT_ID,
            name: "Projector",
          },
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findById("invalid-id");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("findByEquipmentAndDateRange", () => {
    it("should return reservations within date range for equipment", async () => {
      const startTime = new Date("2024-01-01T09:00:00Z");
      const endTime = new Date("2024-01-01T12:00:00Z");

      const mockData = [
        {
          reservation: {
            id: TEST_RESERVATION_ID,
            startTime: new Date("2024-01-01T10:00:00Z"),
            endTime: new Date("2024-01-01T11:00:00Z"),
            comment: null,
            userId: TEST_USER_ID,
            equipmentId: TEST_EQUIPMENT_ID,
          },
          user: {
            id: TEST_USER_ID,
            name: "John Doe",
          },
          equipment: {
            id: TEST_EQUIPMENT_ID,
            name: "Projector",
          },
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByEquipmentAndDateRange(
        TEST_EQUIPMENT_ID,
        startTime,
        endTime,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].equipmentId).toBe(TEST_EQUIPMENT_ID);
      }
    });

    it("should return empty array when no overlapping reservations", async () => {
      const startTime = new Date("2024-01-02T09:00:00Z");
      const endTime = new Date("2024-01-02T12:00:00Z");

      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByEquipmentAndDateRange(
        TEST_EQUIPMENT_ID,
        startTime,
        endTime,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should return error when database query fails", async () => {
      const startTime = new Date("2024-01-01T09:00:00Z");
      const endTime = new Date("2024-01-01T12:00:00Z");

      const error = new Error("Database error");
      // Create a builder that rejects when awaited
      const builder: any = createMockBuilder([]);
      // Override then to reject
      builder.then = vi.fn((onResolve: any, onReject: any) => {
        if (onReject) {
          return Promise.reject(error).catch(onReject);
        }
        return Promise.reject(error);
      });
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByEquipmentAndDateRange(
        TEST_EQUIPMENT_ID,
        startTime,
        endTime,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(Error);
        expect(result.error.message).toBe("Database error");
      }
    });

    it("should return error when createReservation fails", async () => {
      const startTime = new Date("2024-01-01T09:00:00Z");
      const endTime = new Date("2024-01-01T12:00:00Z");

      const mockData = [
        {
          reservation: {
            id: "invalid-id", // Invalid UUID will cause createReservation to fail
            startTime: new Date("2024-01-01T10:00:00Z"),
            endTime: new Date("2024-01-01T11:00:00Z"),
            comment: null,
            userId: TEST_USER_ID,
            equipmentId: TEST_EQUIPMENT_ID,
          },
          user: {
            id: TEST_USER_ID,
            name: "John Doe",
          },
          equipment: {
            id: TEST_EQUIPMENT_ID,
            name: "Projector",
          },
        },
      ];

      const builder = createMockBuilder(mockData);
      (db.select as any).mockReturnValue(builder);

      const result = await repository.findByEquipmentAndDateRange(
        TEST_EQUIPMENT_ID,
        startTime,
        endTime,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeDefined();
      }
    });
  });

  describe("save", () => {
    it("should save reservation successfully", async () => {
      const reservationResult = createReservation(
        TEST_RESERVATION_ID,
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
        TEST_USER_ID,
        TEST_EQUIPMENT_ID,
        "New meeting",
      );
      if (reservationResult.isErr())
        throw new Error("Failed to create reservation");

      const builder = createMockBuilder(undefined);
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(reservationResult.value);

      expect(result.isOk()).toBe(true);
      expect(db.insert).toHaveBeenCalled();
    });

    it("should return error when save fails", async () => {
      const reservationResult = createReservation(
        TEST_RESERVATION_ID,
        new Date("2024-01-01T10:00:00Z"),
        new Date("2024-01-01T11:00:00Z"),
        TEST_USER_ID,
        TEST_EQUIPMENT_ID,
      );
      if (reservationResult.isErr())
        throw new Error("Failed to create reservation");

      const builder = {
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi.fn().mockRejectedValue(new Error("Save failed")),
      };
      (db.insert as any).mockReturnValue(builder);

      const result = await repository.save(reservationResult.value);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Save failed");
      }
    });
  });

  describe("delete", () => {
    it("should delete reservation successfully", async () => {
      const builder = createMockBuilder(undefined);
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_RESERVATION_ID);

      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });

    it("should return error when delete fails", async () => {
      const builder = createMockBuilder(null);
      builder.where = vi.fn().mockRejectedValue(new Error("Delete failed"));
      (db.delete as any).mockReturnValue(builder);

      const result = await repository.delete(TEST_RESERVATION_ID);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Delete failed");
      }
    });
  });

  describe("findRecentlyUsedEquipmentByUserId", () => {
    it("should return recently used equipment IDs for user", async () => {
      const mockData = [
        { equipmentId: TEST_EQUIPMENT_ID },
        { equipmentId: "550e8400-e29b-41d4-a716-446655440003" },
      ];

      const builder: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockData),
      };
      (db.selectDistinct as any).mockReturnValue(builder);

      const result = await repository.findRecentlyUsedEquipmentByUserId(
        TEST_USER_ID,
        10,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(2);
        expect(result.value[0]).toBe(TEST_EQUIPMENT_ID);
      }
    });

    it("should return empty array when user has no reservations", async () => {
      const builder: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      (db.selectDistinct as any).mockReturnValue(builder);

      const result = await repository.findRecentlyUsedEquipmentByUserId(
        TEST_USER_ID,
        10,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });

    it("should return error when query fails", async () => {
      const builder: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      (db.selectDistinct as any).mockReturnValue(builder);

      const result = await repository.findRecentlyUsedEquipmentByUserId(
        TEST_USER_ID,
        10,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Database error");
      }
    });

    it("should respect limit parameter", async () => {
      const mockData = [{ equipmentId: TEST_EQUIPMENT_ID }];

      const builder: any = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue(mockData),
      };
      (db.selectDistinct as any).mockReturnValue(builder);

      const result = await repository.findRecentlyUsedEquipmentByUserId(
        TEST_USER_ID,
        1,
      );

      expect(result.isOk()).toBe(true);
      expect(builder.limit).toHaveBeenCalledWith(1);
    });
  });
});

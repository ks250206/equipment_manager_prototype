import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEquipment } from "@/domain/models/Equipment/Equipment";

// Mocking the module
vi.mock("@/infrastructure/database/drizzle", () => ({
  db: {
    execute: vi.fn(),
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
    transaction: vi.fn(),
    query: {
      equipment: {
        findFirst: vi.fn(),
      },
    },
  },
}));

vi.mock("@/infrastructure/database/schema", () => ({
  equipment: {
    id: "id",
    name: "name",
    description: "description",
    categoryMajor: "categoryMajor",
    categoryMinor: "categoryMinor",
    roomId: "roomId",
    administratorId: "administratorId",
    runningState: "runningState",
    installationDate: "installationDate",
  },
  users: {
    id: "id",
    name: "name",
  },
  rooms: {
    id: "id",
    name: "name",
    floorId: "floorId",
  },
  floors: {
    id: "id",
    name: "name",
    buildingId: "buildingId",
  },
  buildings: {
    id: "id",
    name: "name",
  },
  equipmentViceAdministrators: {
    equipmentId: "equipmentId",
    userId: "userId",
  },
}));

import { db } from "@/infrastructure/database/drizzle";
import { drizzleEquipmentRepository } from "./DrizzleEquipmentRepository";

// Helper to create a chainable mock builder that is also awaitable
const createMockBuilder = (result: any) => {
  const builder: any = {};
  builder.from = vi.fn().mockReturnValue(builder);
  builder.leftJoin = vi.fn().mockReturnValue(builder);
  builder.innerJoin = vi.fn().mockReturnValue(builder);
  builder.where = vi.fn().mockReturnValue(builder);
  builder.values = vi.fn().mockReturnValue(builder);
  builder.onConflictDoUpdate = vi.fn().mockResolvedValue(result);
  // Make it awaitable
  builder.then = (resolve: any) => resolve(result);
  return builder;
};

// Use valid UUIDs for testing
const TEST_EQUIPMENT_ID = "550e8400-e29b-41d4-a716-446655440000";
const TEST_ROOM_ID = "550e8400-e29b-41d4-a716-446655440001";
const TEST_EQUIPMENT_ID_2 = "550e8400-e29b-41d4-a716-446655440002";
const TEST_ADMIN_ID = "550e8400-e29b-41d4-a716-446655440003";

describe("DrizzleEquipmentRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findAll", () => {
    it("should return all equipment", async () => {
      // Mock db response for column check
      (db.execute as any).mockResolvedValue({
        rows: [
          { column_name: "category_major" },
          { column_name: "category_minor" },
        ],
      });

      const mockEquipment = {
        id: TEST_EQUIPMENT_ID,
        name: "Test Equipment",
        description: "Description",
        categoryMajor: "Major",
        categoryMinor: "Minor",
        roomId: TEST_ROOM_ID,
        runningState: "OPERATIONAL",
        installationDate: new Date(),
        administratorId: TEST_ADMIN_ID,
      };

      const mockData = [
        {
          equipment: mockEquipment,
          administrator: null,
          room: null,
          floor: null,
          building: null,
        },
      ];

      // Mock select chain for equipment query
      const equipmentBuilder = createMockBuilder(mockData);

      // Mock select chain for vice administrators query
      const viceAdminBuilder = createMockBuilder([]);

      // Mock select to return different builders based on call order
      let callCount = 0;
      (db.select as any).mockImplementation(() => {
        if (callCount === 0) {
          callCount++;
          return equipmentBuilder;
        } else {
          return viceAdminBuilder;
        }
      });

      const result = await drizzleEquipmentRepository.findAll();

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(TEST_EQUIPMENT_ID);
        expect(result.value[0].name).toBe("Test Equipment");
      }
    });
  });

  describe("findById", () => {
    it("should return equipment by id", async () => {
      (db.execute as any).mockResolvedValue({
        rows: [
          { column_name: "category_major" },
          { column_name: "category_minor" },
        ],
      });

      const mockEquipment = {
        id: TEST_EQUIPMENT_ID,
        name: "Test Equipment",
        description: "Description",
        categoryMajor: "Major",
        categoryMinor: "Minor",
        roomId: TEST_ROOM_ID,
        runningState: "OPERATIONAL",
        installationDate: new Date(),
        administratorId: TEST_ADMIN_ID,
      };

      const mockData = [
        {
          equipment: mockEquipment,
          administrator: null,
          room: null,
          floor: null,
          building: null,
        },
      ];

      // Mock select chain for equipment query
      const equipmentBuilder = createMockBuilder(mockData);

      // Mock select chain for vice administrators query
      const viceAdminBuilder = createMockBuilder([]);

      // Mock select to return different builders based on call order
      let callCount = 0;
      (db.select as any).mockImplementation(() => {
        if (callCount === 0) {
          callCount++;
          return equipmentBuilder;
        } else {
          return viceAdminBuilder;
        }
      });

      const result =
        await drizzleEquipmentRepository.findById(TEST_EQUIPMENT_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).not.toBeNull();
        expect(result.value?.id).toBe(TEST_EQUIPMENT_ID);
      }
    });

    it("should return null if not found", async () => {
      (db.execute as any).mockResolvedValue({
        rows: [
          { column_name: "category_major" },
          { column_name: "category_minor" },
        ],
      });

      // Mock select chain returning empty array
      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result =
        await drizzleEquipmentRepository.findById(TEST_EQUIPMENT_ID_2);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toBeNull();
      }
    });
  });

  describe("save", () => {
    it("should save equipment", async () => {
      (db.execute as any).mockResolvedValue({
        rows: [
          { column_name: "category_major" },
          { column_name: "category_minor" },
        ],
      });

      const equipmentResult = createEquipment(
        TEST_EQUIPMENT_ID,
        "New Equipment",
        "Desc",
        "Major",
        "Minor",
        TEST_ROOM_ID,
      );
      if (equipmentResult.isErr()) {
        throw new Error(
          "Failed to create equipment: " + equipmentResult.error.message,
        );
      }
      const equipment = equipmentResult.value;

      // Mock transaction
      const mockTransaction = vi.fn().mockImplementation(async (callback) => {
        const mockTx = {
          insert: vi.fn().mockReturnValue({
            values: vi.fn().mockReturnValue({
              onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
            }),
          }),
          delete: vi.fn().mockReturnValue({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        };
        return await callback(mockTx);
      });
      (db.transaction as any).mockImplementation(mockTransaction);

      const result = await drizzleEquipmentRepository.save(equipment);

      expect(result.isOk()).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });
  });

  describe("findByRoomId", () => {
    it("should return equipment by room id", async () => {
      (db.execute as any).mockResolvedValue({
        rows: [
          { column_name: "category_major" },
          { column_name: "category_minor" },
        ],
      });

      const mockEquipment = {
        id: TEST_EQUIPMENT_ID,
        name: "Test Equipment",
        description: "Description",
        categoryMajor: "Major",
        categoryMinor: "Minor",
        roomId: TEST_ROOM_ID,
        runningState: "OPERATIONAL",
        installationDate: new Date(),
        administratorId: TEST_ADMIN_ID,
      };

      const mockData = [
        {
          equipment: mockEquipment,
          administrator: null,
          room: null,
          floor: null,
          building: null,
        },
      ];

      // Mock select chain for equipment query
      const equipmentBuilder = createMockBuilder(mockData);

      // Mock select chain for vice administrators query (called for each equipment)
      const viceAdminBuilder = createMockBuilder([]);

      // Mock select to return different builders based on call order
      let callCount = 0;
      (db.select as any).mockImplementation(() => {
        if (callCount === 0) {
          callCount++;
          return equipmentBuilder;
        } else {
          return viceAdminBuilder;
        }
      });

      const result =
        await drizzleEquipmentRepository.findByRoomId(TEST_ROOM_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(1);
        expect(result.value[0].id).toBe(TEST_EQUIPMENT_ID);
        expect(result.value[0].roomId).toBe(TEST_ROOM_ID);
      }
    });

    it("should return empty array when no equipment in room", async () => {
      (db.execute as any).mockResolvedValue({
        rows: [
          { column_name: "category_major" },
          { column_name: "category_minor" },
        ],
      });

      const builder = createMockBuilder([]);
      (db.select as any).mockReturnValue(builder);

      const result =
        await drizzleEquipmentRepository.findByRoomId(TEST_ROOM_ID);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value).toHaveLength(0);
      }
    });
  });

  describe("delete", () => {
    it("should delete equipment", async () => {
      // Mock delete chain
      const builder = createMockBuilder(undefined);
      (db.delete as any).mockReturnValue(builder);

      const result = await drizzleEquipmentRepository.delete(TEST_EQUIPMENT_ID);
      expect(result.isOk()).toBe(true);
      expect(db.delete).toHaveBeenCalled();
    });
  });
});

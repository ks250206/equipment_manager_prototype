import { describe, it, expect } from "vitest";
import {
  createEquipment,
  EquipmentError,
  EquipmentRunningState,
} from "./Equipment";

describe("Equipment Domain Model", () => {
  describe("createEquipment", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";
    const validName = "Microscope A";
    const validRoomId = "550e8400-e29b-41d4-a716-446655440001";
    const validAdminId = "550e8400-e29b-41d4-a716-446655440002";

    it("should create a valid equipment with all fields", () => {
      const installationDate = new Date("2024-01-15");
      const result = createEquipment(
        validId,
        validName,
        "High-resolution microscope",
        "Laboratory",
        "Microscope",
        validRoomId,
        "OPERATIONAL",
        installationDate,
        validAdminId,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const equipment = result.value;
        expect(equipment.id).toBe(validId);
        expect(equipment.name).toBe(validName);
        expect(equipment.description).toBe("High-resolution microscope");
        expect(equipment.categoryMajor).toBe("Laboratory");
        expect(equipment.categoryMinor).toBe("Microscope");
        expect(equipment.roomId).toBe(validRoomId);
        expect(equipment.runningState).toBe("OPERATIONAL");
        expect(equipment.installationDate).toEqual(installationDate);
        expect(equipment.administratorId).toBe(validAdminId);
      }
    });

    it("should create a valid equipment with minimal fields", () => {
      const result = createEquipment(validId, validName);

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        const equipment = result.value;
        expect(equipment.id).toBe(validId);
        expect(equipment.name).toBe(validName);
        expect(equipment.description).toBeNull();
        expect(equipment.categoryMajor).toBeNull();
        expect(equipment.categoryMinor).toBeNull();
        expect(equipment.roomId).toBeNull();
        expect(equipment.runningState).toBe("OPERATIONAL"); // default
        expect(equipment.installationDate).toBeNull();
        expect(equipment.administratorId).toBeNull();
      }
    });

    it("should create equipment with administrator info", () => {
      const administrator = { id: validAdminId, name: "Admin User" };
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        null,
        "OPERATIONAL",
        null,
        validAdminId,
        [], // viceAdministratorIds
        administrator,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.administrator).toEqual(administrator);
      }
    });

    it("should accept valid running states", () => {
      const states: EquipmentRunningState[] = [
        "OPERATIONAL",
        "MAINTENANCE",
        "OUT_OF_SERVICE",
        "RETIRED",
      ];

      states.forEach((state) => {
        const result = createEquipment(
          validId,
          validName,
          null,
          null,
          null,
          null,
          state,
        );
        expect(result.isOk()).toBe(true);
        if (result.isOk()) {
          expect(result.value.runningState).toBe(state);
        }
      });
    });

    it("should return error for invalid equipment ID", () => {
      const result = createEquipment("invalid-id", validName);

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(EquipmentError);
        expect(result.error.message).toBe("Invalid Equipment ID");
      }
    });

    it("should return error for invalid equipment name", () => {
      const result = createEquipment(validId, "");

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(EquipmentError);
        expect(result.error.message).toBe("Invalid Equipment Name");
      }
    });

    it("should return error for invalid room ID", () => {
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        "invalid-room-id",
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Invalid Room ID");
      }
    });

    it("should return error for invalid running state", () => {
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        null,
        "INVALID_STATE" as EquipmentRunningState,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Invalid Running State");
      }
    });

    it("should return error for invalid administrator ID", () => {
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        null,
        "OPERATIONAL",
        null,
        "invalid-admin-id",
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Invalid Administrator ID");
      }
    });

    it("should return error for invalid vice administrator ID", () => {
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        null,
        "OPERATIONAL",
        null,
        null,
        ["invalid-vice-admin-id"],
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error.message).toBe("Invalid Vice Administrator ID");
      }
    });

    it("should create equipment with valid vice administrator IDs", () => {
      const validViceAdminId = "550e8400-e29b-41d4-a716-446655440003";
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        null,
        "OPERATIONAL",
        null,
        null,
        [validViceAdminId],
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.viceAdministratorIds).toHaveLength(1);
        expect(result.value.viceAdministratorIds[0]).toBe(validViceAdminId);
      }
    });

    it("should create equipment with vice administrators info", () => {
      const validViceAdminId = "550e8400-e29b-41d4-a716-446655440003";
      const viceAdministrators = [
        { id: validViceAdminId, name: "Vice Admin User" },
      ];
      const result = createEquipment(
        validId,
        validName,
        null,
        null,
        null,
        null,
        "OPERATIONAL",
        null,
        null,
        [validViceAdminId],
        undefined,
        viceAdministrators,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.viceAdministrators).toBeDefined();
        expect(result.value.viceAdministrators).toHaveLength(1);
        expect(result.value.viceAdministrators?.[0].id).toBe(validViceAdminId);
        expect(result.value.viceAdministrators?.[0].name).toBe(
          "Vice Admin User",
        );
      }
    });
  });
});

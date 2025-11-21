import { describe, it, expect } from "vitest";
import {
  createMaintenanceRecord,
  MaintenanceRecordError,
} from "./MaintenanceRecord";

describe("createMaintenanceRecord", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";
  const validEquipmentId = "550e8400-e29b-41d4-a716-446655440001";
  const validUserId = "550e8400-e29b-41d4-a716-446655440002";
  const validRecordDate = new Date("2025-01-15T10:00:00Z");
  const validDescription = "Replaced air filter";

  it("should create a valid maintenance record with all fields", () => {
    const result = createMaintenanceRecord(
      validId,
      validEquipmentId,
      validRecordDate,
      validDescription,
      validUserId,
      5000,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const record = result.value;
      expect(record.id).toBe(validId);
      expect(record.equipmentId).toBe(validEquipmentId);
      expect(record.recordDate).toEqual(validRecordDate);
      expect(record.description).toBe(validDescription);
      expect(record.performedBy).toBe(validUserId);
      expect(record.cost).toBe(5000);
    }
  });

  it("should create a valid maintenance record without cost", () => {
    const result = createMaintenanceRecord(
      validId,
      validEquipmentId,
      validRecordDate,
      validDescription,
      validUserId,
      null,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.cost).toBeNull();
    }
  });

  it("should create a valid maintenance record with extended user info", () => {
    const performedByUser = { id: validUserId, name: "John Doe" };
    const result = createMaintenanceRecord(
      validId,
      validEquipmentId,
      validRecordDate,
      validDescription,
      validUserId,
      null,
      performedByUser,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.performedByUser).toEqual(performedByUser);
    }
  });

  it("should return error for invalid ID", () => {
    const result = createMaintenanceRecord(
      "invalid-id",
      validEquipmentId,
      validRecordDate,
      validDescription,
      validUserId,
      null,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(MaintenanceRecordError);
      expect(result.error.message).toContain("Invalid Maintenance Record ID");
    }
  });

  it("should return error for invalid equipment ID", () => {
    const result = createMaintenanceRecord(
      validId,
      "invalid-equipment-id",
      validRecordDate,
      validDescription,
      validUserId,
      null,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid Equipment ID");
    }
  });

  it("should return error for invalid user ID", () => {
    const result = createMaintenanceRecord(
      validId,
      validEquipmentId,
      validRecordDate,
      validDescription,
      "invalid-user-id",
      null,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid User ID");
    }
  });

  it("should return error for empty description", () => {
    const result = createMaintenanceRecord(
      validId,
      validEquipmentId,
      validRecordDate,
      "",
      validUserId,
      null,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid Description");
    }
  });

  it("should return error for negative cost", () => {
    const result = createMaintenanceRecord(
      validId,
      validEquipmentId,
      validRecordDate,
      validDescription,
      validUserId,
      -100,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid Cost");
    }
  });
});

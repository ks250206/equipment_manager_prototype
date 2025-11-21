import { describe, it, expect } from "vitest";
import { createReservation, ReservationError } from "./Reservation";

describe("Reservation Domain Model", () => {
  describe("createReservation", () => {
    const validId = "550e8400-e29b-41d4-a716-446655440000";
    const validUserId = "550e8400-e29b-41d4-a716-446655440001";
    const validEquipmentId = "550e8400-e29b-41d4-a716-446655440002";
    const validStartTime = new Date("2024-01-01T10:00:00Z");
    const validEndTime = new Date("2024-01-01T11:00:00Z");

    it("should create a valid reservation with required fields only", () => {
      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.id).toBe(validId);
        expect(result.value.startTime).toEqual(validStartTime);
        expect(result.value.endTime).toEqual(validEndTime);
        expect(result.value.userId).toBe(validUserId);
        expect(result.value.equipmentId).toBe(validEquipmentId);
        expect(result.value.comment).toBeNull();
        expect(result.value.booker).toBeUndefined();
        expect(result.value.equipment).toBeUndefined();
      }
    });

    it("should create a valid reservation with comment", () => {
      const comment = "Important meeting";

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
        comment,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.comment).toBe(comment);
      }
    });

    it("should create a valid reservation with null comment", () => {
      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
        null,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.comment).toBeNull();
      }
    });

    it("should create a valid reservation with booker information", () => {
      const booker = { id: validUserId, name: "John Doe" };

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
        null,
        booker,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.booker).toBeDefined();
        expect(result.value.booker?.id).toBe(validUserId);
        expect(result.value.booker?.name).toBe("John Doe");
      }
    });

    it("should create a valid reservation with booker having null name", () => {
      const booker = { id: validUserId, name: null };

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
        null,
        booker,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.booker).toBeDefined();
        expect(result.value.booker?.name).toBeNull();
      }
    });

    it("should create a valid reservation with equipment information", () => {
      const equipment = { id: validEquipmentId, name: "Projector" };

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
        null,
        undefined,
        equipment,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.equipment).toBeDefined();
        expect(result.value.equipment?.id).toBe(validEquipmentId);
        expect(result.value.equipment?.name).toBe("Projector");
      }
    });

    it("should create a valid reservation with both booker and equipment information", () => {
      const booker = { id: validUserId, name: "John Doe" };
      const equipment = { id: validEquipmentId, name: "Projector" };

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
        "Team meeting",
        booker,
        equipment,
      );

      expect(result.isOk()).toBe(true);
      if (result.isOk()) {
        expect(result.value.comment).toBe("Team meeting");
        expect(result.value.booker).toBeDefined();
        expect(result.value.equipment).toBeDefined();
      }
    });

    it("should return error for invalid reservation ID", () => {
      const invalidId = "not-a-uuid";

      const result = createReservation(
        invalidId,
        validStartTime,
        validEndTime,
        validUserId,
        validEquipmentId,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ReservationError);
        expect(result.error.message).toBe("Invalid Reservation ID");
      }
    });

    it("should return error for invalid user ID", () => {
      const invalidUserId = "not-a-uuid";

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        invalidUserId,
        validEquipmentId,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ReservationError);
        expect(result.error.message).toBe("Invalid User ID");
      }
    });

    it("should return error for invalid equipment ID", () => {
      const invalidEquipmentId = "not-a-uuid";

      const result = createReservation(
        validId,
        validStartTime,
        validEndTime,
        validUserId,
        invalidEquipmentId,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ReservationError);
        expect(result.error.message).toBe("Invalid Equipment ID");
      }
    });

    it("should return error when start time is after end time", () => {
      const startTime = new Date("2024-01-01T11:00:00Z");
      const endTime = new Date("2024-01-01T10:00:00Z");

      const result = createReservation(
        validId,
        startTime,
        endTime,
        validUserId,
        validEquipmentId,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ReservationError);
        expect(result.error.message).toBe("Start time must be before end time");
      }
    });

    it("should return error when start time equals end time", () => {
      const sameTime = new Date("2024-01-01T10:00:00Z");

      const result = createReservation(
        validId,
        sameTime,
        sameTime,
        validUserId,
        validEquipmentId,
      );

      expect(result.isErr()).toBe(true);
      if (result.isErr()) {
        expect(result.error).toBeInstanceOf(ReservationError);
        expect(result.error.message).toBe("Start time must be before end time");
      }
    });
  });
});

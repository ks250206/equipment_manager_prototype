import { describe, it, expect } from "vitest";
import {
  createEquipmentComment,
  EquipmentCommentError,
} from "./EquipmentComment";

describe("createEquipmentComment", () => {
  const validId = "550e8400-e29b-41d4-a716-446655440000";
  const validEquipmentId = "550e8400-e29b-41d4-a716-446655440001";
  const validUserId = "550e8400-e29b-41d4-a716-446655440002";
  const validContent = "This equipment works great!";
  const validCreatedAt = new Date("2025-01-15T10:00:00Z");

  it("should create a valid equipment comment with all fields", () => {
    const result = createEquipmentComment(
      validId,
      validEquipmentId,
      validUserId,
      validContent,
      validCreatedAt,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      const comment = result.value;
      expect(comment.id).toBe(validId);
      expect(comment.equipmentId).toBe(validEquipmentId);
      expect(comment.userId).toBe(validUserId);
      expect(comment.content).toBe(validContent);
      expect(comment.createdAt).toEqual(validCreatedAt);
    }
  });

  it("should create a valid comment with author info", () => {
    const author = { id: validUserId, name: "Jane Doe" };
    const result = createEquipmentComment(
      validId,
      validEquipmentId,
      validUserId,
      validContent,
      validCreatedAt,
      author,
    );

    expect(result.isOk()).toBe(true);
    if (result.isOk()) {
      expect(result.value.author).toEqual(author);
    }
  });

  it("should return error for invalid ID", () => {
    const result = createEquipmentComment(
      "invalid-id",
      validEquipmentId,
      validUserId,
      validContent,
      validCreatedAt,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error).toBeInstanceOf(EquipmentCommentError);
      expect(result.error.message).toContain("Invalid Equipment Comment ID");
    }
  });

  it("should return error for invalid equipment ID", () => {
    const result = createEquipmentComment(
      validId,
      "invalid-equipment-id",
      validUserId,
      validContent,
      validCreatedAt,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid Equipment ID");
    }
  });

  it("should return error for invalid user ID", () => {
    const result = createEquipmentComment(
      validId,
      validEquipmentId,
      "invalid-user-id",
      validContent,
      validCreatedAt,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid User ID");
    }
  });

  it("should return error for empty content", () => {
    const result = createEquipmentComment(
      validId,
      validEquipmentId,
      validUserId,
      "",
      validCreatedAt,
    );

    expect(result.isErr()).toBe(true);
    if (result.isErr()) {
      expect(result.error.message).toContain("Invalid Content");
    }
  });
});

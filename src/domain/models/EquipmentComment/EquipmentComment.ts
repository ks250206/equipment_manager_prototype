import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { EquipmentId, EquipmentIdSchema } from "../Equipment/Equipment";
import { UserId, UserIdSchema } from "../User/User";

// Value Objects
export const EquipmentCommentIdSchema = z.string().uuid();
export type EquipmentCommentId = z.infer<typeof EquipmentCommentIdSchema>;

export const EquipmentCommentContentSchema = z.string().min(1);
export type EquipmentCommentContent = z.infer<
  typeof EquipmentCommentContentSchema
>;

// Entity
export type EquipmentComment = {
  readonly id: EquipmentCommentId;
  readonly equipmentId: EquipmentId;
  readonly userId: UserId;
  readonly content: EquipmentCommentContent;
  readonly createdAt: Date;
  // Extended information for display
  readonly author?: {
    id: UserId;
    name: string | null;
  };
};

// Domain Errors
export class EquipmentCommentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EquipmentCommentError";
  }
}

// Factory
export const createEquipmentComment = (
  id: string,
  equipmentId: string,
  userId: string,
  content: string,
  createdAt: Date,
  author?: { id: string; name: string | null },
): Result<EquipmentComment, EquipmentCommentError> => {
  const idResult = EquipmentCommentIdSchema.safeParse(id);
  if (!idResult.success)
    return err(new EquipmentCommentError("Invalid Equipment Comment ID"));

  const equipmentIdResult = EquipmentIdSchema.safeParse(equipmentId);
  if (!equipmentIdResult.success)
    return err(new EquipmentCommentError("Invalid Equipment ID"));

  const userIdResult = UserIdSchema.safeParse(userId);
  if (!userIdResult.success)
    return err(new EquipmentCommentError("Invalid User ID"));

  const contentResult = EquipmentCommentContentSchema.safeParse(content);
  if (!contentResult.success)
    return err(new EquipmentCommentError("Invalid Content"));

  return ok({
    id: idResult.data,
    equipmentId: equipmentIdResult.data,
    userId: userIdResult.data,
    content: contentResult.data,
    createdAt,
    author: author
      ? {
          id: UserIdSchema.parse(author.id),
          name: author.name,
        }
      : undefined,
  });
};

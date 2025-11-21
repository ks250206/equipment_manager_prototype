import { IEquipmentCommentRepository } from "@/domain/models/EquipmentComment/IEquipmentCommentRepository";
import {
  EquipmentComment,
  EquipmentCommentId,
  createEquipmentComment,
} from "@/domain/models/EquipmentComment/EquipmentComment";
import { EquipmentId } from "@/domain/models/Equipment/Equipment";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import {
  equipmentComments as equipmentCommentTable,
  users as userTable,
} from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";

export class DrizzleEquipmentCommentRepository
  implements IEquipmentCommentRepository
{
  async findByEquipmentId(
    equipmentId: EquipmentId,
  ): Promise<Result<EquipmentComment[], Error>> {
    try {
      const rows = await db
        .select({
          comment: equipmentCommentTable,
          user: userTable,
        })
        .from(equipmentCommentTable)
        .innerJoin(userTable, eq(equipmentCommentTable.userId, userTable.id))
        .where(eq(equipmentCommentTable.equipmentId, equipmentId));

      const comments: EquipmentComment[] = [];
      for (const row of rows) {
        const commentResult = createEquipmentComment(
          row.comment.id,
          row.comment.equipmentId,
          row.comment.userId,
          row.comment.content,
          row.comment.createdAt,
          { id: row.user.id, name: row.user.name },
        );
        if (commentResult.isErr()) {
          return err(commentResult.error);
        }
        comments.push(commentResult.value);
      }
      return ok(comments);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(
    comment: EquipmentComment,
  ): Promise<Result<EquipmentComment, Error>> {
    try {
      await db
        .insert(equipmentCommentTable)
        .values({
          id: comment.id,
          equipmentId: comment.equipmentId,
          userId: comment.userId,
          content: comment.content,
          createdAt: comment.createdAt,
        })
        .onConflictDoUpdate({
          target: equipmentCommentTable.id,
          set: {
            equipmentId: comment.equipmentId,
            userId: comment.userId,
            content: comment.content,
            createdAt: comment.createdAt,
          },
        });
      return ok(comment);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: EquipmentCommentId): Promise<Result<void, Error>> {
    try {
      await db
        .delete(equipmentCommentTable)
        .where(eq(equipmentCommentTable.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

export const drizzleEquipmentCommentRepository =
  new DrizzleEquipmentCommentRepository();

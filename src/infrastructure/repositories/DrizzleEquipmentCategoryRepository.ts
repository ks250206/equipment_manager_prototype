import { db } from "@/infrastructure/database/drizzle";
import { equipmentCategories } from "@/infrastructure/database/schema";
import {
  createEquipmentCategory,
  EquipmentCategory,
  EquipmentCategoryId,
} from "@/domain/models/Equipment/EquipmentCategory";
import { IEquipmentCategoryRepository } from "@/domain/models/Equipment/IEquipmentCategoryRepository";
import { Result, ok, err } from "neverthrow";
import { eq } from "drizzle-orm";

export class DrizzleEquipmentCategoryRepository
  implements IEquipmentCategoryRepository
{
  async findAll(): Promise<Result<EquipmentCategory[], Error>> {
    try {
      const rows = await db.select().from(equipmentCategories);
      const categories: EquipmentCategory[] = [];
      for (const row of rows) {
        const categoryResult = createEquipmentCategory(
          row.id,
          row.categoryMajor,
          row.categoryMinor,
        );
        if (categoryResult.isErr()) {
          return err(categoryResult.error);
        }
        categories.push(categoryResult.value);
      }
      return ok(categories);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findById(
    id: EquipmentCategoryId,
  ): Promise<Result<EquipmentCategory | null, Error>> {
    try {
      const row = await db.query.equipmentCategories.findFirst({
        where: eq(equipmentCategories.id, id),
      });

      if (!row) return ok(null);

      const categoryResult = createEquipmentCategory(
        row.id,
        row.categoryMajor,
        row.categoryMinor,
      );
      if (categoryResult.isErr()) {
        return err(categoryResult.error);
      }
      return ok(categoryResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(
    category: EquipmentCategory,
  ): Promise<Result<EquipmentCategory, Error>> {
    try {
      await db
        .insert(equipmentCategories)
        .values({
          id: category.id,
          categoryMajor: category.categoryMajor,
          categoryMinor: category.categoryMinor,
        })
        .onConflictDoUpdate({
          target: equipmentCategories.id,
          set: {
            categoryMajor: category.categoryMajor,
            categoryMinor: category.categoryMinor,
          },
        });
      return ok(category);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: EquipmentCategoryId): Promise<Result<void, Error>> {
    try {
      await db
        .delete(equipmentCategories)
        .where(eq(equipmentCategories.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

import { Result, ok, err } from "neverthrow";
import { z } from "zod";

export const EquipmentCategoryIdSchema = z.string().uuid();
export type EquipmentCategoryId = z.infer<typeof EquipmentCategoryIdSchema>;

const EquipmentCategoryMajorSchema = z.string().min(1);
const EquipmentCategoryMinorSchema = z.string().min(1);

export type EquipmentCategory = {
  readonly id: EquipmentCategoryId;
  readonly categoryMajor: string;
  readonly categoryMinor: string;
};

export class EquipmentCategoryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EquipmentCategoryError";
  }
}

export const createEquipmentCategory = (
  id: string,
  categoryMajor: string,
  categoryMinor: string,
): Result<EquipmentCategory, EquipmentCategoryError> => {
  const idResult = EquipmentCategoryIdSchema.safeParse(id);
  if (!idResult.success)
    return err(new EquipmentCategoryError("Invalid Category ID"));

  const majorResult = EquipmentCategoryMajorSchema.safeParse(categoryMajor);
  if (!majorResult.success)
    return err(new EquipmentCategoryError("Invalid Category Major"));

  const minorResult = EquipmentCategoryMinorSchema.safeParse(categoryMinor);
  if (!minorResult.success)
    return err(new EquipmentCategoryError("Invalid Category Minor"));

  return ok({
    id: idResult.data,
    categoryMajor: majorResult.data,
    categoryMinor: minorResult.data,
  });
};

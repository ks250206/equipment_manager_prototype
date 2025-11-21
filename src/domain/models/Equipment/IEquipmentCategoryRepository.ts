import { Result } from "neverthrow";
import { EquipmentCategory, EquipmentCategoryId } from "./EquipmentCategory";

export interface IEquipmentCategoryRepository {
  findAll(): Promise<Result<EquipmentCategory[], Error>>;
  findById(
    id: EquipmentCategoryId,
  ): Promise<Result<EquipmentCategory | null, Error>>;
  save(category: EquipmentCategory): Promise<Result<EquipmentCategory, Error>>;
  delete(id: EquipmentCategoryId): Promise<Result<void, Error>>;
}

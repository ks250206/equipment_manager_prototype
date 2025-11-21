import { Result } from "neverthrow";
import { EquipmentComment, EquipmentCommentId } from "./EquipmentComment";
import { EquipmentId } from "../Equipment/Equipment";

export interface IEquipmentCommentRepository {
  findByEquipmentId(
    equipmentId: EquipmentId,
  ): Promise<Result<EquipmentComment[], Error>>;
  save(comment: EquipmentComment): Promise<Result<EquipmentComment, Error>>;
  delete(id: EquipmentCommentId): Promise<Result<void, Error>>;
}

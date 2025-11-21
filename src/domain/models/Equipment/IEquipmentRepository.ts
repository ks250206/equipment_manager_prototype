import { Result } from "neverthrow";
import { Equipment, EquipmentId } from "./Equipment";
import { RoomId } from "../Room/Room";

export interface IEquipmentRepository {
  findAll(): Promise<Result<Equipment[], Error>>;
  findById(id: EquipmentId): Promise<Result<Equipment | null, Error>>;
  findByRoomId(roomId: RoomId): Promise<Result<Equipment[], Error>>;
  save(equipment: Equipment): Promise<Result<Equipment, Error>>;
  delete(id: EquipmentId): Promise<Result<void, Error>>;
}

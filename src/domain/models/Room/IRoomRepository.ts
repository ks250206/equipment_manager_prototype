import { Result } from "neverthrow";
import { Room, RoomId } from "./Room";
import { FloorId } from "../Floor/Floor";

export interface IRoomRepository {
  findAll(): Promise<Result<Room[], Error>>;
  findById(id: RoomId): Promise<Result<Room | null, Error>>;
  findByFloorId(floorId: FloorId): Promise<Result<Room[], Error>>;
  save(room: Room): Promise<Result<Room, Error>>;
  delete(id: RoomId): Promise<Result<void, Error>>;
}

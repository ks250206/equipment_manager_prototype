import { Result } from "neverthrow";
import { Floor, FloorId } from "./Floor";
import { BuildingId } from "../Building/Building";

export interface IFloorRepository {
  findAll(): Promise<Result<Floor[], Error>>;
  findById(id: FloorId): Promise<Result<Floor | null, Error>>;
  findByBuildingId(buildingId: BuildingId): Promise<Result<Floor[], Error>>;
  save(floor: Floor): Promise<Result<Floor, Error>>;
  delete(id: FloorId): Promise<Result<void, Error>>;
}

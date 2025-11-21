import { Result } from "neverthrow";
import { Building, BuildingId } from "./Building";

export interface IBuildingRepository {
  findAll(): Promise<Result<Building[], Error>>;
  findById(id: BuildingId): Promise<Result<Building | null, Error>>;
  save(building: Building): Promise<Result<Building, Error>>;
  delete(id: BuildingId): Promise<Result<void, Error>>;
}

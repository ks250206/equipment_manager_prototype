import { Result } from "neverthrow";
import { MaintenanceRecord, MaintenanceRecordId } from "./MaintenanceRecord";
import { EquipmentId } from "../Equipment/Equipment";

export interface IMaintenanceRecordRepository {
  findAll(): Promise<Result<MaintenanceRecord[], Error>>;
  findById(
    id: MaintenanceRecordId,
  ): Promise<Result<MaintenanceRecord | null, Error>>;
  findByEquipmentId(
    equipmentId: EquipmentId,
  ): Promise<Result<MaintenanceRecord[], Error>>;
  save(record: MaintenanceRecord): Promise<Result<MaintenanceRecord, Error>>;
  delete(id: MaintenanceRecordId): Promise<Result<void, Error>>;
}

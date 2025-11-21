import { Result } from "neverthrow";
import { Reservation, ReservationId } from "./Reservation";
import { EquipmentId } from "../Equipment/Equipment";

export interface IReservationRepository {
  findAll(): Promise<Result<Reservation[], Error>>;
  findById(id: ReservationId): Promise<Result<Reservation | null, Error>>;
  findByEquipmentAndDateRange(
    equipmentId: EquipmentId,
    startTime: Date,
    endTime: Date,
  ): Promise<Result<Reservation[], Error>>;
  save(reservation: Reservation): Promise<Result<Reservation, Error>>;
  delete(id: ReservationId): Promise<Result<void, Error>>;
}

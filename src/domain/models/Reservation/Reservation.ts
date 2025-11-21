import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { UserId, UserIdSchema } from "../User/User";
import { EquipmentId, EquipmentIdSchema } from "../Equipment/Equipment";

// Value Objects
export const ReservationIdSchema = z.string().uuid();
export type ReservationId = z.infer<typeof ReservationIdSchema>;

// Entity
export type Reservation = {
  readonly id: ReservationId;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly comment: string | null;
  readonly userId: UserId;
  readonly equipmentId: EquipmentId;
  // Extended information for display
  readonly booker?: {
    id: UserId;
    name: string | null;
  };
  readonly equipment?: {
    id: EquipmentId;
    name: string;
  };
};

// Domain Errors
export class ReservationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReservationError";
  }
}

// Factory
export const createReservation = (
  id: string,
  startTime: Date,
  endTime: Date,
  userId: string,
  equipmentId: string,
  comment: string | null = null,
  booker?: { id: string; name: string | null },
  equipment?: { id: string; name: string },
): Result<Reservation, ReservationError> => {
  const idResult = ReservationIdSchema.safeParse(id);
  if (!idResult.success)
    return err(new ReservationError("Invalid Reservation ID"));

  const userIdResult = UserIdSchema.safeParse(userId);
  if (!userIdResult.success)
    return err(new ReservationError("Invalid User ID"));

  const equipmentIdResult = EquipmentIdSchema.safeParse(equipmentId);
  if (!equipmentIdResult.success)
    return err(new ReservationError("Invalid Equipment ID"));

  if (startTime >= endTime) {
    return err(new ReservationError("Start time must be before end time"));
  }

  return ok({
    id: idResult.data,
    startTime,
    endTime,
    comment,
    userId: userIdResult.data,
    equipmentId: equipmentIdResult.data,
    booker: booker
      ? {
          id: UserIdSchema.parse(booker.id),
          name: booker.name,
        }
      : undefined,
    equipment: equipment
      ? {
          id: EquipmentIdSchema.parse(equipment.id),
          name: equipment.name,
        }
      : undefined,
  });
};

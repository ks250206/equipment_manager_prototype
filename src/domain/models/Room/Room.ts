import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { FloorId, FloorIdSchema } from "../Floor/Floor";

// Value Objects
export const RoomIdSchema = z.string().uuid();
export type RoomId = z.infer<typeof RoomIdSchema>;

export const RoomNameSchema = z.string().min(1);
export type RoomName = z.infer<typeof RoomNameSchema>;

// Entity
export type Room = {
  readonly id: RoomId;
  readonly name: RoomName;
  readonly floorId: FloorId;
  readonly capacity: number | null;
};

// Domain Errors
export class RoomError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RoomError";
  }
}

// Factory
export const createRoom = (
  id: string,
  name: string,
  floorId: string,
  capacity: number | null = null,
): Result<Room, RoomError> => {
  const idResult = RoomIdSchema.safeParse(id);
  if (!idResult.success) return err(new RoomError("Invalid Room ID"));

  const nameResult = RoomNameSchema.safeParse(name);
  if (!nameResult.success) return err(new RoomError("Invalid Room Name"));

  const floorIdResult = FloorIdSchema.safeParse(floorId);
  if (!floorIdResult.success) return err(new RoomError("Invalid Floor ID"));

  return ok({
    id: idResult.data,
    name: nameResult.data,
    floorId: floorIdResult.data,
    capacity,
  });
};

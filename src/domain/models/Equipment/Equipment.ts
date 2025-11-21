import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { RoomId, RoomIdSchema } from "../Room/Room";
import { UserId, UserIdSchema } from "../User/User";

// Value Objects
export const EquipmentIdSchema = z.string().uuid();
export type EquipmentId = z.infer<typeof EquipmentIdSchema>;

export const EquipmentNameSchema = z.string().min(1);
export type EquipmentName = z.infer<typeof EquipmentNameSchema>;

export const EquipmentRunningStateSchema = z.enum([
  "OPERATIONAL",
  "MAINTENANCE",
  "OUT_OF_SERVICE",
  "RETIRED",
]);
export type EquipmentRunningState = z.infer<typeof EquipmentRunningStateSchema>;

// Entity
export type Equipment = {
  readonly id: EquipmentId;
  readonly name: EquipmentName;
  readonly description: string | null;
  readonly categoryMajor: string | null;
  readonly categoryMinor: string | null;
  readonly roomId: RoomId | null;
  readonly runningState: EquipmentRunningState;
  readonly installationDate: Date | null;
  readonly administratorId: UserId | null;
  readonly viceAdministratorIds: UserId[];
  // Extended information for display
  readonly administrator?: {
    id: UserId;
    name: string | null;
  };
  readonly viceAdministrators?: {
    id: UserId;
    name: string | null;
  }[];
  readonly location?: {
    buildingName: string;
    floorName: string;
    roomName: string;
  };
};

// Domain Errors
export class EquipmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EquipmentError";
  }
}

// Factory
export const createEquipment = (
  id: string,
  name: string,
  description: string | null = null,
  categoryMajor: string | null = null,
  categoryMinor: string | null = null,
  roomId: string | null = null,
  runningState: EquipmentRunningState = "OPERATIONAL",
  installationDate: Date | null = null,
  administratorId: string | null = null,
  viceAdministratorIds: string[] = [],
  administrator?: { id: string; name: string | null },
  viceAdministrators?: { id: string; name: string | null }[],
  location?: { buildingName: string; floorName: string; roomName: string },
): Result<Equipment, EquipmentError> => {
  const idResult = EquipmentIdSchema.safeParse(id);
  if (!idResult.success) return err(new EquipmentError("Invalid Equipment ID"));

  const nameResult = EquipmentNameSchema.safeParse(name);
  if (!nameResult.success)
    return err(new EquipmentError("Invalid Equipment Name"));

  // Validate roomId if provided
  if (roomId !== null) {
    const roomIdResult = RoomIdSchema.safeParse(roomId);
    if (!roomIdResult.success)
      return err(new EquipmentError("Invalid Room ID"));
  }

  // Validate runningState
  const runningStateResult =
    EquipmentRunningStateSchema.safeParse(runningState);
  if (!runningStateResult.success)
    return err(new EquipmentError("Invalid Running State"));

  // Validate administratorId if provided
  if (administratorId !== null) {
    const adminIdResult = UserIdSchema.safeParse(administratorId);
    if (!adminIdResult.success)
      return err(new EquipmentError("Invalid Administrator ID"));
  }

  // Validate viceAdministratorIds
  const validViceAdminIds: UserId[] = [];
  for (const viceAdminId of viceAdministratorIds) {
    const result = UserIdSchema.safeParse(viceAdminId);
    if (!result.success)
      return err(new EquipmentError("Invalid Vice Administrator ID"));
    validViceAdminIds.push(result.data);
  }

  return ok({
    id: idResult.data,
    name: nameResult.data,
    description,
    categoryMajor,
    categoryMinor,
    roomId,
    runningState: runningStateResult.data,
    installationDate,
    administratorId,
    viceAdministratorIds: validViceAdminIds,
    administrator: administrator
      ? {
          id: UserIdSchema.parse(administrator.id),
          name: administrator.name,
        }
      : undefined,
    viceAdministrators: viceAdministrators?.map((v) => ({
      id: UserIdSchema.parse(v.id),
      name: v.name,
    })),
    location,
  });
};

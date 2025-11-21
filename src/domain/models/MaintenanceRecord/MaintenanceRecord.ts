import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { EquipmentId, EquipmentIdSchema } from "../Equipment/Equipment";
import { UserId, UserIdSchema } from "../User/User";

// Value Objects
export const MaintenanceRecordIdSchema = z.string().uuid();
export type MaintenanceRecordId = z.infer<typeof MaintenanceRecordIdSchema>;

export const MaintenanceRecordDescriptionSchema = z.string().min(1);
export type MaintenanceRecordDescription = z.infer<
  typeof MaintenanceRecordDescriptionSchema
>;

export const MaintenanceRecordCostSchema = z.number().int().nonnegative();
export type MaintenanceRecordCost = z.infer<typeof MaintenanceRecordCostSchema>;

// Entity
export type MaintenanceRecord = {
  readonly id: MaintenanceRecordId;
  readonly equipmentId: EquipmentId;
  readonly recordDate: Date;
  readonly description: MaintenanceRecordDescription;
  readonly performedBy: UserId;
  readonly cost: MaintenanceRecordCost | null;
  // Extended information for display
  readonly performedByUser?: {
    id: UserId;
    name: string | null;
  };
};

// Domain Errors
export class MaintenanceRecordError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MaintenanceRecordError";
  }
}

// Factory
export const createMaintenanceRecord = (
  id: string,
  equipmentId: string,
  recordDate: Date,
  description: string,
  performedBy: string,
  cost: number | null = null,
  performedByUser?: { id: string; name: string | null },
): Result<MaintenanceRecord, MaintenanceRecordError> => {
  const idResult = MaintenanceRecordIdSchema.safeParse(id);
  if (!idResult.success)
    return err(new MaintenanceRecordError("Invalid Maintenance Record ID"));

  const equipmentIdResult = EquipmentIdSchema.safeParse(equipmentId);
  if (!equipmentIdResult.success)
    return err(new MaintenanceRecordError("Invalid Equipment ID"));

  const performedByResult = UserIdSchema.safeParse(performedBy);
  if (!performedByResult.success)
    return err(new MaintenanceRecordError("Invalid User ID"));

  const descriptionResult =
    MaintenanceRecordDescriptionSchema.safeParse(description);
  if (!descriptionResult.success)
    return err(new MaintenanceRecordError("Invalid Description"));

  // Validate cost if provided
  if (cost !== null) {
    const costResult = MaintenanceRecordCostSchema.safeParse(cost);
    if (!costResult.success)
      return err(new MaintenanceRecordError("Invalid Cost"));
  }

  return ok({
    id: idResult.data,
    equipmentId: equipmentIdResult.data,
    recordDate,
    description: descriptionResult.data,
    performedBy: performedByResult.data,
    cost,
    performedByUser: performedByUser
      ? {
          id: UserIdSchema.parse(performedByUser.id),
          name: performedByUser.name,
        }
      : undefined,
  });
};

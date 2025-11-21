import { Result, ok, err } from "neverthrow";
import { z } from "zod";
import { BuildingId, BuildingIdSchema } from "../Building/Building";

// Value Objects
export const FloorIdSchema = z.string().uuid();
export type FloorId = z.infer<typeof FloorIdSchema>;

export const FloorNameSchema = z.string().min(1);
export type FloorName = z.infer<typeof FloorNameSchema>;

// Entity
export type Floor = {
  readonly id: FloorId;
  readonly name: FloorName;
  readonly buildingId: BuildingId;
  readonly floorNumber: number | null;
};

// Domain Errors
export class FloorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FloorError";
  }
}

// Factory
export const createFloor = (
  id: string,
  name: string,
  buildingId: string,
  floorNumber: number | null = null,
): Result<Floor, FloorError> => {
  const idResult = FloorIdSchema.safeParse(id);
  if (!idResult.success) return err(new FloorError("Invalid Floor ID"));

  const nameResult = FloorNameSchema.safeParse(name);
  if (!nameResult.success) return err(new FloorError("Invalid Floor Name"));

  const buildingIdResult = BuildingIdSchema.safeParse(buildingId);
  if (!buildingIdResult.success)
    return err(new FloorError("Invalid Building ID"));

  return ok({
    id: idResult.data,
    name: nameResult.data,
    buildingId: buildingIdResult.data,
    floorNumber,
  });
};

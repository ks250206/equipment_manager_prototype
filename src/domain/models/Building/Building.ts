import { Result, ok, err } from "neverthrow";
import { z } from "zod";

// Value Objects
export const BuildingIdSchema = z.string().uuid();
export type BuildingId = z.infer<typeof BuildingIdSchema>;

export const BuildingNameSchema = z.string().min(1);
export type BuildingName = z.infer<typeof BuildingNameSchema>;

// Entity
export type Building = {
  readonly id: BuildingId;
  readonly name: BuildingName;
  readonly address: string | null;
};

// Domain Errors
export class BuildingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BuildingError";
  }
}

// Factory
export const createBuilding = (
  id: string,
  name: string,
  address: string | null = null,
): Result<Building, BuildingError> => {
  const idResult = BuildingIdSchema.safeParse(id);
  if (!idResult.success) return err(new BuildingError("Invalid Building ID"));

  const nameResult = BuildingNameSchema.safeParse(name);
  if (!nameResult.success)
    return err(new BuildingError("Invalid Building Name"));

  return ok({
    id: idResult.data,
    name: nameResult.data,
    address,
  });
};

import { IBuildingRepository } from "@/domain/models/Building/IBuildingRepository";
import {
  Building,
  BuildingId,
  createBuilding,
} from "@/domain/models/Building/Building";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import { buildings as buildingsTable } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";

export class DrizzleBuildingRepository implements IBuildingRepository {
  async findAll(): Promise<Result<Building[], Error>> {
    try {
      const rows = await db.select().from(buildingsTable);
      const buildings: Building[] = [];
      for (const row of rows) {
        const buildingResult = createBuilding(row.id, row.name, row.address);
        if (buildingResult.isErr()) {
          return err(buildingResult.error);
        }
        buildings.push(buildingResult.value);
      }
      return ok(buildings);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findById(id: BuildingId): Promise<Result<Building | null, Error>> {
    try {
      const row = await db.query.buildings.findFirst({
        where: eq(buildingsTable.id, id),
      });

      if (!row) return ok(null);

      const buildingResult = createBuilding(row.id, row.name, row.address);
      if (buildingResult.isErr()) {
        return err(buildingResult.error);
      }
      return ok(buildingResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(building: Building): Promise<Result<Building, Error>> {
    try {
      await db
        .insert(buildingsTable)
        .values({
          id: building.id,
          name: building.name,
          address: building.address,
        })
        .onConflictDoUpdate({
          target: buildingsTable.id,
          set: {
            name: building.name,
            address: building.address,
          },
        });
      return ok(building);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: BuildingId): Promise<Result<void, Error>> {
    try {
      await db.delete(buildingsTable).where(eq(buildingsTable.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

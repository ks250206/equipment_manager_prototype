import { IFloorRepository } from "@/domain/models/Floor/IFloorRepository";
import { Floor, FloorId, createFloor } from "@/domain/models/Floor/Floor";
import { BuildingId } from "@/domain/models/Building/Building";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import { floors as floorsTable } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";

export class DrizzleFloorRepository implements IFloorRepository {
  async findAll(): Promise<Result<Floor[], Error>> {
    try {
      const rows = await db.select().from(floorsTable);
      const floors: Floor[] = [];
      for (const row of rows) {
        const floorResult = createFloor(
          row.id,
          row.name,
          row.buildingId,
          row.floorNumber,
        );
        if (floorResult.isErr()) {
          return err(floorResult.error);
        }
        floors.push(floorResult.value);
      }
      return ok(floors);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findById(id: FloorId): Promise<Result<Floor | null, Error>> {
    try {
      const row = await db.query.floors.findFirst({
        where: eq(floorsTable.id, id),
      });

      if (!row) return ok(null);

      const floorResult = createFloor(
        row.id,
        row.name,
        row.buildingId,
        row.floorNumber,
      );
      if (floorResult.isErr()) {
        return err(floorResult.error);
      }
      return ok(floorResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findByBuildingId(
    buildingId: BuildingId,
  ): Promise<Result<Floor[], Error>> {
    try {
      const rows = await db
        .select()
        .from(floorsTable)
        .where(eq(floorsTable.buildingId, buildingId));
      const floors: Floor[] = [];
      for (const row of rows) {
        const floorResult = createFloor(
          row.id,
          row.name,
          row.buildingId,
          row.floorNumber,
        );
        if (floorResult.isErr()) {
          return err(floorResult.error);
        }
        floors.push(floorResult.value);
      }
      return ok(floors);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(floor: Floor): Promise<Result<Floor, Error>> {
    try {
      await db
        .insert(floorsTable)
        .values({
          id: floor.id,
          name: floor.name,
          buildingId: floor.buildingId,
          floorNumber: floor.floorNumber,
        })
        .onConflictDoUpdate({
          target: floorsTable.id,
          set: {
            name: floor.name,
            buildingId: floor.buildingId,
            floorNumber: floor.floorNumber,
          },
        });
      return ok(floor);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: FloorId): Promise<Result<void, Error>> {
    try {
      await db.delete(floorsTable).where(eq(floorsTable.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

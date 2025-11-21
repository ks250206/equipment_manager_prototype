import { IMaintenanceRecordRepository } from "@/domain/models/MaintenanceRecord/IMaintenanceRecordRepository";
import {
  MaintenanceRecord,
  MaintenanceRecordId,
  createMaintenanceRecord,
} from "@/domain/models/MaintenanceRecord/MaintenanceRecord";
import { EquipmentId } from "@/domain/models/Equipment/Equipment";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import {
  maintenanceRecords as maintenanceRecordTable,
  users as userTable,
} from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";

export class DrizzleMaintenanceRecordRepository
  implements IMaintenanceRecordRepository
{
  async findAll(): Promise<Result<MaintenanceRecord[], Error>> {
    try {
      const rows = await db
        .select({
          record: maintenanceRecordTable,
          user: userTable,
        })
        .from(maintenanceRecordTable)
        .innerJoin(
          userTable,
          eq(maintenanceRecordTable.performedBy, userTable.id),
        );

      const records: MaintenanceRecord[] = [];
      for (const row of rows) {
        const recordResult = createMaintenanceRecord(
          row.record.id,
          row.record.equipmentId,
          row.record.recordDate,
          row.record.description,
          row.record.performedBy,
          row.record.cost,
          { id: row.user.id, name: row.user.name },
        );
        if (recordResult.isErr()) {
          return err(recordResult.error);
        }
        records.push(recordResult.value);
      }
      return ok(records);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findById(
    id: MaintenanceRecordId,
  ): Promise<Result<MaintenanceRecord | null, Error>> {
    try {
      const rows = await db
        .select({
          record: maintenanceRecordTable,
          user: userTable,
        })
        .from(maintenanceRecordTable)
        .innerJoin(
          userTable,
          eq(maintenanceRecordTable.performedBy, userTable.id),
        )
        .where(eq(maintenanceRecordTable.id, id));

      const row = rows[0];

      if (!row) return ok(null);

      const recordResult = createMaintenanceRecord(
        row.record.id,
        row.record.equipmentId,
        row.record.recordDate,
        row.record.description,
        row.record.performedBy,
        row.record.cost,
        { id: row.user.id, name: row.user.name },
      );
      if (recordResult.isErr()) {
        return err(recordResult.error);
      }
      return ok(recordResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findByEquipmentId(
    equipmentId: EquipmentId,
  ): Promise<Result<MaintenanceRecord[], Error>> {
    try {
      const rows = await db
        .select({
          record: maintenanceRecordTable,
          user: userTable,
        })
        .from(maintenanceRecordTable)
        .innerJoin(
          userTable,
          eq(maintenanceRecordTable.performedBy, userTable.id),
        )
        .where(eq(maintenanceRecordTable.equipmentId, equipmentId));

      const records: MaintenanceRecord[] = [];
      for (const row of rows) {
        const recordResult = createMaintenanceRecord(
          row.record.id,
          row.record.equipmentId,
          row.record.recordDate,
          row.record.description,
          row.record.performedBy,
          row.record.cost,
          { id: row.user.id, name: row.user.name },
        );
        if (recordResult.isErr()) {
          return err(recordResult.error);
        }
        records.push(recordResult.value);
      }
      return ok(records);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(
    record: MaintenanceRecord,
  ): Promise<Result<MaintenanceRecord, Error>> {
    try {
      await db
        .insert(maintenanceRecordTable)
        .values({
          id: record.id,
          equipmentId: record.equipmentId,
          recordDate: record.recordDate,
          description: record.description,
          performedBy: record.performedBy,
          cost: record.cost,
        })
        .onConflictDoUpdate({
          target: maintenanceRecordTable.id,
          set: {
            equipmentId: record.equipmentId,
            recordDate: record.recordDate,
            description: record.description,
            performedBy: record.performedBy,
            cost: record.cost,
          },
        });
      return ok(record);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: MaintenanceRecordId): Promise<Result<void, Error>> {
    try {
      await db
        .delete(maintenanceRecordTable)
        .where(eq(maintenanceRecordTable.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

export const drizzleMaintenanceRecordRepository =
  new DrizzleMaintenanceRecordRepository();

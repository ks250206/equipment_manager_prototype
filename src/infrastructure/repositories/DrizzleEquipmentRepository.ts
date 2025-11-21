import { IEquipmentRepository } from "@/domain/models/Equipment/IEquipmentRepository";
import {
  Equipment,
  EquipmentId,
  createEquipment,
  EquipmentRunningState,
} from "@/domain/models/Equipment/Equipment";
import { RoomId } from "@/domain/models/Room/Room";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import {
  equipment as equipmentTable,
  users as userTable,
  rooms as roomsTable,
  floors as floorsTable,
  buildings as buildingsTable,
  equipmentViceAdministrators,
} from "@/infrastructure/database/schema";
import { eq, sql } from "drizzle-orm";

type EquipmentRow = typeof equipmentTable.$inferSelect;

// Factory function to create the repository and manage state (closure)
const createDrizzleEquipmentRepository = (): IEquipmentRepository => {
  let categoryColumnsAvailable: boolean | null = null;

  const hasCategoryColumns = async (): Promise<boolean> => {
    if (categoryColumnsAvailable !== null) {
      return categoryColumnsAvailable;
    }

    try {
      const result = await db.execute<{ column_name: string }>(sql`
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'equipment'
          AND column_name IN ('category_major', 'category_minor')
      `);
      const columnNames = result.rows?.map((row) => row.column_name) ?? [];
      categoryColumnsAvailable =
        columnNames.includes("category_major") &&
        columnNames.includes("category_minor");
      return categoryColumnsAvailable;
    } catch {
      return false;
    }
  };

  const mapEquipmentRow = (
    row: EquipmentRow,
    includeCategories: boolean,
    administrator?: { id: string; name: string | null },
    viceAdministrators: { id: string; name: string | null }[] = [],
    location?: { buildingName: string; floorName: string; roomName: string },
  ) => {
    return createEquipment(
      row.id,
      row.name,
      row.description,
      includeCategories ? row.categoryMajor : null,
      includeCategories ? row.categoryMinor : null,
      row.roomId,
      (row.runningState as EquipmentRunningState) || "OPERATIONAL",
      row.installationDate,
      row.administratorId,
      viceAdministrators.map((v) => v.id),
      administrator,
      viceAdministrators,
      location,
    );
  };

  return {
    async findAll(): Promise<Result<Equipment[], Error>> {
      try {
        const includeCategories = await hasCategoryColumns();

        // 1. Fetch Equipments with Administrator and Location
        const equipmentRows = await db
          .select({
            equipment: equipmentTable,
            administrator: userTable,
            room: roomsTable,
            floor: floorsTable,
            building: buildingsTable,
          })
          .from(equipmentTable)
          .leftJoin(userTable, eq(equipmentTable.administratorId, userTable.id))
          .leftJoin(roomsTable, eq(equipmentTable.roomId, roomsTable.id))
          .leftJoin(floorsTable, eq(roomsTable.floorId, floorsTable.id))
          .leftJoin(
            buildingsTable,
            eq(floorsTable.buildingId, buildingsTable.id),
          );

        const equipments: Equipment[] = [];

        // 2. Fetch all vice administrators
        // This might be heavy if there are many equipments.
        // But for now let's do it per equipment or in bulk if possible.
        // Let's do it per equipment loop for simplicity first, or bulk fetch all pairs.

        const allViceAdmins = await db
          .select({
            equipmentId: equipmentViceAdministrators.equipmentId,
            user: userTable,
          })
          .from(equipmentViceAdministrators)
          .innerJoin(
            userTable,
            eq(equipmentViceAdministrators.userId, userTable.id),
          );

        const viceAdminsMap = new Map<
          string,
          { id: string; name: string | null }[]
        >();
        for (const va of allViceAdmins) {
          if (!viceAdminsMap.has(va.equipmentId)) {
            viceAdminsMap.set(va.equipmentId, []);
          }
          viceAdminsMap.get(va.equipmentId)?.push({
            id: va.user.id,
            name: va.user.name,
          });
        }

        for (const row of equipmentRows) {
          const administrator = row.administrator
            ? { id: row.administrator.id, name: row.administrator.name }
            : undefined;

          const location =
            row.room && row.floor && row.building
              ? {
                  buildingName: row.building.name,
                  floorName: row.floor.name,
                  roomName: row.room.name,
                }
              : undefined;

          const viceAdministrators = viceAdminsMap.get(row.equipment.id) || [];

          const equipmentResult = mapEquipmentRow(
            row.equipment,
            includeCategories,
            administrator,
            viceAdministrators,
            location,
          );
          if (equipmentResult.isErr()) {
            return err(equipmentResult.error);
          }
          equipments.push(equipmentResult.value);
        }
        return ok(equipments);
      } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
      }
    },

    async findById(id: EquipmentId): Promise<Result<Equipment | null, Error>> {
      try {
        const includeCategories = await hasCategoryColumns();
        const rows = await db
          .select({
            equipment: equipmentTable,
            administrator: userTable,
            room: roomsTable,
            floor: floorsTable,
            building: buildingsTable,
          })
          .from(equipmentTable)
          .leftJoin(userTable, eq(equipmentTable.administratorId, userTable.id))
          .leftJoin(roomsTable, eq(equipmentTable.roomId, roomsTable.id))
          .leftJoin(floorsTable, eq(roomsTable.floorId, floorsTable.id))
          .leftJoin(
            buildingsTable,
            eq(floorsTable.buildingId, buildingsTable.id),
          )
          .where(eq(equipmentTable.id, id));

        const row = rows[0];

        if (!row) return ok(null);

        const administrator = row.administrator
          ? { id: row.administrator.id, name: row.administrator.name }
          : undefined;

        const location =
          row.room && row.floor && row.building
            ? {
                buildingName: row.building.name,
                floorName: row.floor.name,
                roomName: row.room.name,
              }
            : undefined;

        // Fetch vice administrators
        const viceAdmins = await db
          .select({
            user: userTable,
          })
          .from(equipmentViceAdministrators)
          .innerJoin(
            userTable,
            eq(equipmentViceAdministrators.userId, userTable.id),
          )
          .where(eq(equipmentViceAdministrators.equipmentId, id));

        const viceAdministrators = viceAdmins.map((va) => ({
          id: va.user.id,
          name: va.user.name,
        }));

        const equipmentResult = mapEquipmentRow(
          row.equipment,
          includeCategories,
          administrator,
          viceAdministrators,
          location,
        );
        if (equipmentResult.isErr()) {
          return err(equipmentResult.error);
        }
        return ok(equipmentResult.value);
      } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
      }
    },

    async findByRoomId(roomId: RoomId): Promise<Result<Equipment[], Error>> {
      try {
        const includeCategories = await hasCategoryColumns();
        const rows = await db
          .select({
            equipment: equipmentTable,
            administrator: userTable,
            room: roomsTable,
            floor: floorsTable,
            building: buildingsTable,
          })
          .from(equipmentTable)
          .leftJoin(userTable, eq(equipmentTable.administratorId, userTable.id))
          .leftJoin(roomsTable, eq(equipmentTable.roomId, roomsTable.id))
          .leftJoin(floorsTable, eq(roomsTable.floorId, floorsTable.id))
          .leftJoin(
            buildingsTable,
            eq(floorsTable.buildingId, buildingsTable.id),
          )
          .where(eq(equipmentTable.roomId, roomId));

        // Fetch all vice admins for these equipments
        // For optimization, we could filter by equipment IDs, but for now let's fetch all or loop.
        // Let's loop for simplicity as room usually has limited equipments.

        const equipments: Equipment[] = [];
        for (const row of rows) {
          const administrator = row.administrator
            ? { id: row.administrator.id, name: row.administrator.name }
            : undefined;

          const location =
            row.room && row.floor && row.building
              ? {
                  buildingName: row.building.name,
                  floorName: row.floor.name,
                  roomName: row.room.name,
                }
              : undefined;

          // Fetch vice administrators for this equipment
          const viceAdmins = await db
            .select({
              user: userTable,
            })
            .from(equipmentViceAdministrators)
            .innerJoin(
              userTable,
              eq(equipmentViceAdministrators.userId, userTable.id),
            )
            .where(
              eq(equipmentViceAdministrators.equipmentId, row.equipment.id),
            );

          const viceAdministrators = viceAdmins.map((va) => ({
            id: va.user.id,
            name: va.user.name,
          }));

          const equipmentResult = mapEquipmentRow(
            row.equipment,
            includeCategories,
            administrator,
            viceAdministrators,
            location,
          );
          if (equipmentResult.isErr()) {
            return err(equipmentResult.error);
          }
          equipments.push(equipmentResult.value);
        }
        return ok(equipments);
      } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
      }
    },

    async save(equipment: Equipment): Promise<Result<Equipment, Error>> {
      try {
        const includeCategories = await hasCategoryColumns();
        const insertValues = includeCategories
          ? {
              id: equipment.id,
              name: equipment.name,
              description: equipment.description,
              categoryMajor: equipment.categoryMajor,
              categoryMinor: equipment.categoryMinor,
              roomId: equipment.roomId,
              runningState: equipment.runningState,
              installationDate: equipment.installationDate,
              administratorId: equipment.administratorId,
            }
          : {
              id: equipment.id,
              name: equipment.name,
              description: equipment.description,
              roomId: equipment.roomId,
              runningState: equipment.runningState,
              installationDate: equipment.installationDate,
              administratorId: equipment.administratorId,
            };

        const updateValues = includeCategories
          ? {
              name: equipment.name,
              description: equipment.description,
              categoryMajor: equipment.categoryMajor,
              categoryMinor: equipment.categoryMinor,
              roomId: equipment.roomId,
              runningState: equipment.runningState,
              installationDate: equipment.installationDate,
              administratorId: equipment.administratorId,
            }
          : {
              name: equipment.name,
              description: equipment.description,
              roomId: equipment.roomId,
              runningState: equipment.runningState,
              installationDate: equipment.installationDate,
              administratorId: equipment.administratorId,
            };

        await db.transaction(async (tx) => {
          await tx
            .insert(equipmentTable)
            .values(insertValues)
            .onConflictDoUpdate({
              target: equipmentTable.id,
              set: updateValues,
            });

          // Handle Vice Administrators
          // 1. Delete existing
          await tx
            .delete(equipmentViceAdministrators)
            .where(eq(equipmentViceAdministrators.equipmentId, equipment.id));

          // 2. Insert new ones
          if (equipment.viceAdministratorIds.length > 0) {
            await tx.insert(equipmentViceAdministrators).values(
              equipment.viceAdministratorIds.map((userId) => ({
                equipmentId: equipment.id,
                userId: userId,
              })),
            );
          }
        });

        return ok(equipment);
      } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
      }
    },

    async delete(id: EquipmentId): Promise<Result<void, Error>> {
      try {
        await db.delete(equipmentTable).where(eq(equipmentTable.id, id));
        return ok(undefined);
      } catch (error) {
        return err(error instanceof Error ? error : new Error("Unknown error"));
      }
    },
  };
};

// Export a singleton instance for general use
export const drizzleEquipmentRepository = createDrizzleEquipmentRepository();

import { IRoomRepository } from "@/domain/models/Room/IRoomRepository";
import { Room, RoomId, createRoom } from "@/domain/models/Room/Room";
import { FloorId } from "@/domain/models/Floor/Floor";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import { rooms as roomsTable } from "@/infrastructure/database/schema";
import { eq } from "drizzle-orm";

export class DrizzleRoomRepository implements IRoomRepository {
  async findAll(): Promise<Result<Room[], Error>> {
    try {
      const rows = await db.select().from(roomsTable);
      const rooms: Room[] = [];
      for (const row of rows) {
        const roomResult = createRoom(
          row.id,
          row.name,
          row.floorId,
          row.capacity,
        );
        if (roomResult.isErr()) {
          return err(roomResult.error);
        }
        rooms.push(roomResult.value);
      }
      return ok(rooms);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findById(id: RoomId): Promise<Result<Room | null, Error>> {
    try {
      const row = await db.query.rooms.findFirst({
        where: eq(roomsTable.id, id),
      });

      if (!row) return ok(null);

      const roomResult = createRoom(
        row.id,
        row.name,
        row.floorId,
        row.capacity,
      );
      if (roomResult.isErr()) {
        return err(roomResult.error);
      }
      return ok(roomResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findByFloorId(floorId: FloorId): Promise<Result<Room[], Error>> {
    try {
      const rows = await db
        .select()
        .from(roomsTable)
        .where(eq(roomsTable.floorId, floorId));
      const rooms: Room[] = [];
      for (const row of rows) {
        const roomResult = createRoom(
          row.id,
          row.name,
          row.floorId,
          row.capacity,
        );
        if (roomResult.isErr()) {
          return err(roomResult.error);
        }
        rooms.push(roomResult.value);
      }
      return ok(rooms);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(room: Room): Promise<Result<Room, Error>> {
    try {
      await db
        .insert(roomsTable)
        .values({
          id: room.id,
          name: room.name,
          floorId: room.floorId,
          capacity: room.capacity,
        })
        .onConflictDoUpdate({
          target: roomsTable.id,
          set: {
            name: room.name,
            floorId: room.floorId,
            capacity: room.capacity,
          },
        });
      return ok(room);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: RoomId): Promise<Result<void, Error>> {
    try {
      await db.delete(roomsTable).where(eq(roomsTable.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

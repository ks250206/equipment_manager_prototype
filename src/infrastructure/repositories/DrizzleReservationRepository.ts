import { IReservationRepository } from "@/domain/models/Reservation/IReservationRepository";
import {
  Reservation,
  ReservationId,
  createReservation,
} from "@/domain/models/Reservation/Reservation";
import { EquipmentId } from "@/domain/models/Equipment/Equipment";
import { Result, ok, err } from "neverthrow";
import { db } from "@/infrastructure/database/drizzle";
import {
  reservations as reservationTable,
  users as userTable,
  equipment as equipmentTable,
} from "@/infrastructure/database/schema";
import { eq, and, gte, lte, or, desc } from "drizzle-orm";

export class DrizzleReservationRepository implements IReservationRepository {
  async findAll(): Promise<Result<Reservation[], Error>> {
    try {
      const rows = await db
        .select({
          reservation: reservationTable,
          user: userTable,
          equipment: equipmentTable,
        })
        .from(reservationTable)
        .innerJoin(userTable, eq(reservationTable.userId, userTable.id))
        .innerJoin(
          equipmentTable,
          eq(reservationTable.equipmentId, equipmentTable.id),
        );

      const reservations: Reservation[] = [];
      for (const row of rows) {
        const reservationResult = createReservation(
          row.reservation.id,
          row.reservation.startTime,
          row.reservation.endTime,
          row.reservation.userId,
          row.reservation.equipmentId,
          row.reservation.comment,
          { id: row.user.id, name: row.user.name },
          { id: row.equipment.id, name: row.equipment.name },
        );
        if (reservationResult.isErr()) {
          return err(reservationResult.error);
        }
        reservations.push(reservationResult.value);
      }
      return ok(reservations);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findById(
    id: ReservationId,
  ): Promise<Result<Reservation | null, Error>> {
    try {
      const rows = await db
        .select({
          reservation: reservationTable,
          user: userTable,
          equipment: equipmentTable,
        })
        .from(reservationTable)
        .innerJoin(userTable, eq(reservationTable.userId, userTable.id))
        .innerJoin(
          equipmentTable,
          eq(reservationTable.equipmentId, equipmentTable.id),
        )
        .where(eq(reservationTable.id, id));

      const row = rows[0];

      if (!row) return ok(null);

      const reservationResult = createReservation(
        row.reservation.id,
        row.reservation.startTime,
        row.reservation.endTime,
        row.reservation.userId,
        row.reservation.equipmentId,
        row.reservation.comment,
        { id: row.user.id, name: row.user.name },
        { id: row.equipment.id, name: row.equipment.name },
      );
      if (reservationResult.isErr()) {
        return err(reservationResult.error);
      }
      return ok(reservationResult.value);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findByEquipmentAndDateRange(
    equipmentId: EquipmentId,
    startTime: Date,
    endTime: Date,
  ): Promise<Result<Reservation[], Error>> {
    try {
      // Check for overlapping reservations
      // (StartA < EndB) and (EndA > StartB)
      const rows = await db
        .select({
          reservation: reservationTable,
          user: userTable,
          equipment: equipmentTable,
        })
        .from(reservationTable)
        .innerJoin(userTable, eq(reservationTable.userId, userTable.id))
        .innerJoin(
          equipmentTable,
          eq(reservationTable.equipmentId, equipmentTable.id),
        )
        .where(
          and(
            eq(reservationTable.equipmentId, equipmentId),
            or(
              and(
                gte(reservationTable.startTime, startTime),
                lte(reservationTable.startTime, endTime),
              ),
              and(
                gte(reservationTable.endTime, startTime),
                lte(reservationTable.endTime, endTime),
              ),
              and(
                lte(reservationTable.startTime, startTime),
                gte(reservationTable.endTime, endTime),
              ),
            ),
          ),
        );

      const reservations: Reservation[] = [];
      for (const row of rows) {
        const reservationResult = createReservation(
          row.reservation.id,
          row.reservation.startTime,
          row.reservation.endTime,
          row.reservation.userId,
          row.reservation.equipmentId,
          row.reservation.comment,
          { id: row.user.id, name: row.user.name },
          { id: row.equipment.id, name: row.equipment.name },
        );
        if (reservationResult.isErr()) {
          return err(reservationResult.error);
        }
        reservations.push(reservationResult.value);
      }
      return ok(reservations);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(reservation: Reservation): Promise<Result<Reservation, Error>> {
    try {
      await db
        .insert(reservationTable)
        .values({
          id: reservation.id,
          startTime: reservation.startTime,
          endTime: reservation.endTime,
          comment: reservation.comment,
          userId: reservation.userId,
          equipmentId: reservation.equipmentId,
        })
        .onConflictDoUpdate({
          target: reservationTable.id,
          set: {
            startTime: reservation.startTime,
            endTime: reservation.endTime,
            comment: reservation.comment,
            userId: reservation.userId,
            equipmentId: reservation.equipmentId,
          },
        });
      return ok(reservation);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async delete(id: ReservationId): Promise<Result<void, Error>> {
    try {
      await db.delete(reservationTable).where(eq(reservationTable.id, id));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findRecentlyUsedEquipmentByUserId(
    userId: string,
    limit: number,
  ): Promise<Result<EquipmentId[], Error>> {
    try {
      const results = await db
        .selectDistinct({ equipmentId: reservationTable.equipmentId })
        .from(reservationTable)
        .where(
          and(
            eq(reservationTable.userId, userId),
            lte(reservationTable.endTime, new Date()),
          ),
        )
        .orderBy(desc(reservationTable.endTime))
        .limit(limit);

      return ok(results.map((r) => r.equipmentId));
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }
}

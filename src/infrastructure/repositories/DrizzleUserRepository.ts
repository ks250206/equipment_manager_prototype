import { IUserRepository } from "@/domain/models/User/IUserRepository";
import {
  User,
  UserId,
  UserEmail,
  createUser,
  DomainError,
} from "@/domain/models/User/User";
import { db } from "@/infrastructure/database/drizzle";
import {
  users,
  userFavoriteEquipments,
  equipment,
  equipmentViceAdministrators,
} from "@/infrastructure/database/schema";
import { eq, and, isNull } from "drizzle-orm";
import { Result, ok, err } from "neverthrow";

export class DrizzleUserRepository implements IUserRepository {
  async findById(id: UserId): Promise<Result<User | null, Error>> {
    try {
      const result = await db.query.users.findFirst({
        where: and(eq(users.id, id), isNull(users.deletedAt)),
      });

      if (!result) {
        return ok(null);
      }

      return this.mapToDomain(result);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findByEmail(email: UserEmail): Promise<Result<User | null, Error>> {
    try {
      const result = await db.query.users.findFirst({
        where: and(eq(users.email, email), isNull(users.deletedAt)),
      });

      if (!result) {
        return ok(null);
      }

      return this.mapToDomain(result);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async findAll(): Promise<Result<User[], Error>> {
    try {
      const results = await db.query.users.findMany({
        where: isNull(users.deletedAt),
      });
      const mappedUsers: User[] = [];
      for (const result of results) {
        const userResult = this.mapToDomain(result);
        if (userResult.isOk()) {
          mappedUsers.push(userResult.value);
        }
      }
      return ok(mappedUsers);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async save(user: User): Promise<Result<User, Error>> {
    try {
      // Check if this is the first user
      const existingUsers = await db.select().from(users);
      let roleToSave = user.role;

      if (existingUsers.length === 0) {
        roleToSave = "ADMIN";
      }

      await db.insert(users).values({
        id: user.id,
        email: user.email,
        password: user.passwordHash,
        name: user.name,
        displayName: user.displayName,
        avatarUrl: user.avatarUrl,
        phoneNumber: user.phoneNumber,
        department: user.department,
        role: roleToSave,
        mustChangePassword: "true", // New users must change password
      });
      return ok(user);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async update(user: User): Promise<Result<User, Error>> {
    try {
      await db
        .update(users)
        .set({
          email: user.email,
          name: user.name,
          displayName: user.displayName,
          avatarUrl: user.avatarUrl,
          phoneNumber: user.phoneNumber,
          department: user.department,
          role: user.role,
        })
        .where(eq(users.id, user.id));
      return ok(user);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async updatePassword(
    userId: UserId,
    newPasswordHash: string,
  ): Promise<Result<void, Error>> {
    try {
      await db
        .update(users)
        .set({
          password: newPasswordHash,
          mustChangePassword: "false",
        })
        .where(eq(users.id, userId));
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async addFavorite(
    userId: UserId,
    equipmentId: string,
  ): Promise<Result<void, Error>> {
    try {
      await db
        .insert(userFavoriteEquipments)
        .values({
          userId,
          equipmentId,
        })
        .onConflictDoNothing();
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async removeFavorite(
    userId: UserId,
    equipmentId: string,
  ): Promise<Result<void, Error>> {
    try {
      await db
        .delete(userFavoriteEquipments)
        .where(
          and(
            eq(userFavoriteEquipments.userId, userId),
            eq(userFavoriteEquipments.equipmentId, equipmentId),
          ),
        );
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async getFavorites(userId: UserId): Promise<Result<string[], Error>> {
    try {
      const results = await db
        .select({ equipmentId: userFavoriteEquipments.equipmentId })
        .from(userFavoriteEquipments)
        .where(eq(userFavoriteEquipments.userId, userId));

      return ok(results.map((r) => r.equipmentId));
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  async softDelete(userId: UserId): Promise<Result<void, Error>> {
    try {
      // 1. Set deletedAt timestamp
      await db
        .update(users)
        .set({
          deletedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // 2. Remove user from equipment administrators
      await db
        .update(equipment)
        .set({
          administratorId: null,
        })
        .where(eq(equipment.administratorId, userId));

      // 3. Remove user from equipment vice administrators
      await db
        .delete(equipmentViceAdministrators)
        .where(eq(equipmentViceAdministrators.userId, userId));

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error("Unknown error"));
    }
  }

  private mapToDomain(
    data: typeof users.$inferSelect,
  ): Result<User, DomainError> {
    return createUser(
      data.id,
      data.email,
      data.password,
      data.name,
      data.role as "GENERAL" | "EDITOR" | "ADMIN",
      data.displayName,
      data.avatarUrl,
      data.phoneNumber,
      data.department,
    );
  }
}

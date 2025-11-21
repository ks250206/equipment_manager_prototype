import { db } from "@/infrastructure/database/drizzle";
import { systemSettings } from "@/infrastructure/database/schema";
import { ISystemSettingsRepository } from "@/domain/models/SystemSettings/ISystemSettingsRepository";
import {
  SystemSetting,
  createSystemSetting,
} from "@/domain/models/SystemSettings/SystemSettings";
import { eq } from "drizzle-orm";
import { Result, ok, err } from "neverthrow";

export class DrizzleSystemSettingsRepository
  implements ISystemSettingsRepository
{
  async findByKey(key: string): Promise<Result<SystemSetting | null, Error>> {
    try {
      const result = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, key),
      });

      if (!result) {
        return ok(null);
      }

      return createSystemSetting(
        result.id,
        result.key,
        result.value,
        result.updatedAt,
        result.updatedBy,
      );
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Failed to find system setting"),
      );
    }
  }

  async save(setting: SystemSetting): Promise<Result<void, Error>> {
    try {
      const existing = await db.query.systemSettings.findFirst({
        where: eq(systemSettings.key, setting.key),
      });

      if (existing) {
        await db
          .update(systemSettings)
          .set({
            value: setting.value,
            updatedAt: new Date(),
            updatedBy: setting.updatedBy,
          })
          .where(eq(systemSettings.key, setting.key));
      } else {
        await db.insert(systemSettings).values({
          id: setting.id,
          key: setting.key,
          value: setting.value,
          updatedAt: setting.updatedAt,
          updatedBy: setting.updatedBy,
        });
      }

      return ok(undefined);
    } catch (error) {
      return err(
        error instanceof Error
          ? error
          : new Error("Failed to save system setting"),
      );
    }
  }
}

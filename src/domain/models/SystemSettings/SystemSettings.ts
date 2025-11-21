import { Result, ok, err } from "neverthrow";

export type SystemSetting = {
  id: string;
  key: string;
  value: string;
  updatedAt: Date;
  updatedBy?: string | null;
};

export const TIMEZONE_KEY = "timezone";
export const DEFAULT_TIMEZONE = "Asia/Tokyo";

export const createSystemSetting = (
  id: string,
  key: string,
  value: string,
  updatedAt: Date,
  updatedBy?: string | null,
): Result<SystemSetting, Error> => {
  if (!key) {
    return err(new Error("Key is required"));
  }

  if (!value) {
    return err(new Error("Value is required"));
  }

  // Validate timezone if the key is timezone
  if (key === TIMEZONE_KEY) {
    try {
      Intl.DateTimeFormat(undefined, { timeZone: value });
    } catch {
      return err(new Error(`Invalid timezone: ${value}`));
    }
  }

  return ok({
    id,
    key,
    value,
    updatedAt,
    updatedBy,
  });
};

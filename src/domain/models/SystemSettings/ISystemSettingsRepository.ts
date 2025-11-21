import { Result } from "neverthrow";
import { SystemSetting } from "./SystemSettings";

export interface ISystemSettingsRepository {
  findByKey(key: string): Promise<Result<SystemSetting | null, Error>>;
  save(setting: SystemSetting): Promise<Result<void, Error>>;
}

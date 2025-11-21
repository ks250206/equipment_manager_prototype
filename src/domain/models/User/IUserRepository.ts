import { Result } from "neverthrow";
import { User, UserId, UserEmail } from "./User";

export interface IUserRepository {
  findById(id: UserId): Promise<Result<User | null, Error>>;
  findByEmail(email: UserEmail): Promise<Result<User | null, Error>>;
  findAll(): Promise<Result<User[], Error>>;
  save(user: User): Promise<Result<User, Error>>;
  update(user: User): Promise<Result<User, Error>>;
  updatePassword(
    userId: UserId,
    newPasswordHash: string,
  ): Promise<Result<void, Error>>;
  softDelete(userId: UserId): Promise<Result<void, Error>>;
}

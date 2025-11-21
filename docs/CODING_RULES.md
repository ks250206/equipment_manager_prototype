# Coding Rules

## Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Auth**: Auth.js (JWT)
- **Container**: Podman (instead of Docker)

## Development Practices

### Functional Programming

- **Avoid Classes**: Prefer functional programming patterns over object-oriented classes. Use functions and data structures (types/interfaces) instead of classes with methods.
- **Immutability**: Prefer immutable data structures where possible.
- **Pure Functions**: Favor pure functions without side effects.

**Example:**

```typescript
// ❌ Avoid: Class-based approach
class UserService {
  constructor(private repo: IUserRepository) {}
  async getUser(id: string) { ... }
}

// ✅ Prefer: Functional approach
export async function getUser(
  repo: IUserRepository,
  id: string
): Promise<Result<User | null, Error>> {
  return await repo.findById(id);
}
```

### Test Driven Development (TDD)

- Write tests before writing code.
- Ensure all new features and bug fixes are covered by tests.
- **Classical School**: Follow the Classical School (Detroit School) approach to TDD, which emphasizes testing the final state and behavior of the system rather than interactions between objects.
- **Test Coverage**: Focus on Domain and Infrastructure layers first, then Application and Presentation layers.

**Test Structure:**

```typescript
describe("createBuilding", () => {
  it("should create a valid building", () => {
    const result = createBuilding("uuid", "Building A", "123 Main St");
    expect(result.isOk()).toBe(true);
  });

  it("should return error for invalid ID", () => {
    const result = createBuilding("invalid-id", "Building A", null);
    expect(result.isErr()).toBe(true);
  });
});
```

### Error Handling

- **Library**: Use `neverthrow` for Result types.
- **Pattern**: Use the `Result` type pattern for error handling instead of throwing exceptions for expected errors.
- This ensures type-safe error handling and explicit failure paths.

**Example:**

```typescript
import { Result, ok, err } from "neverthrow";

export const createUser = (
  id: string,
  email: string,
  passwordHash: string,
): Result<User, DomainError> => {
  const idResult = UserIdSchema.safeParse(id);
  if (!idResult.success) return err(new DomainError("Invalid User ID"));

  const emailResult = UserEmailSchema.safeParse(email);
  if (!emailResult.success) return err(new DomainError("Invalid Email"));

  return ok({
    id: idResult.data,
    email: emailResult.data,
    passwordHash,
    // ...
  });
};
```

### Validation

- Use **Zod** for schema validation.
- Validate all inputs at the boundaries of the application (API endpoints, Server Actions, Forms).
- Define schemas alongside domain models.

**Example:**

```typescript
import { z } from "zod";

export const BuildingIdSchema = z.string().uuid();
export type BuildingId = z.infer<typeof BuildingIdSchema>;

export const BuildingNameSchema = z.string().min(1);
export type BuildingName = z.infer<typeof BuildingNameSchema>;
```

### Naming Conventions

- **Files**: Use PascalCase for component files, camelCase for utility files
- **Types**: Use PascalCase for types and interfaces
- **Functions**: Use camelCase for functions
- **Constants**: Use UPPER_SNAKE_CASE for constants
- **Repository Interfaces**: Prefix with `I` (e.g., `IUserRepository`)
- **Repository Implementations**: Include ORM name (e.g., `DrizzleUserRepository`)

### Code Organization

- Group related code by feature/domain, not by technical layer within each layer
- Keep files focused and single-purpose
- Use barrel exports (`index.ts`) sparingly, only when it improves imports significantly

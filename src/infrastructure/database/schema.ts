import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(), // Hashed
  name: text("name"),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  phoneNumber: text("phone_number"),
  department: text("department"),
  role: text("role").default("GENERAL").notNull(), // ADMIN, EDITOR, GENERAL
  mustChangePassword: text("must_change_password").default("true"), // 'true' or 'false' as string
  deletedAt: timestamp("deleted_at"), // Soft delete timestamp
});

export const buildings = pgTable("buildings", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
});

export const floors = pgTable("floors", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  buildingId: uuid("building_id")
    .references(() => buildings.id)
    .notNull(),
  floorNumber: integer("floor_number"),
});

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  floorId: uuid("floor_id")
    .references(() => floors.id)
    .notNull(),
  capacity: integer("capacity"),
});

export const equipment = pgTable("equipment", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  categoryMajor: text("category_major"),
  categoryMinor: text("category_minor"),
  roomId: uuid("room_id").references(() => rooms.id),
  runningState: text("running_state").default("OPERATIONAL").notNull(),
  installationDate: timestamp("installation_date"),
  administratorId: uuid("administrator_id").references(() => users.id),
});

export const equipmentCategories = pgTable(
  "equipment_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    categoryMajor: text("category_major").notNull(),
    categoryMinor: text("category_minor").notNull(),
  },
  (table) => ({
    uniqueCategory: uniqueIndex("equipment_categories_major_minor_idx").on(
      table.categoryMajor,
      table.categoryMinor,
    ),
  }),
);

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  comment: text("comment"),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  equipmentId: uuid("equipment_id")
    .references(() => equipment.id)
    .notNull(),
});

export const maintenanceRecords = pgTable("maintenance_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id")
    .references(() => equipment.id)
    .notNull(),
  recordDate: timestamp("record_date").notNull(),
  description: text("description").notNull(),
  performedBy: uuid("performed_by")
    .references(() => users.id)
    .notNull(),
  cost: integer("cost"),
});

export const equipmentComments = pgTable("equipment_comments", {
  id: uuid("id").defaultRandom().primaryKey(),
  equipmentId: uuid("equipment_id")
    .references(() => equipment.id)
    .notNull(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const equipmentViceAdministrators = pgTable(
  "equipment_vice_administrators",
  {
    equipmentId: uuid("equipment_id")
      .references(() => equipment.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => ({
    pk: uniqueIndex("equipment_vice_administrators_pk").on(
      table.equipmentId,
      table.userId,
    ),
  }),
);

export const userFavoriteEquipments = pgTable(
  "user_favorite_equipments",
  {
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    equipmentId: uuid("equipment_id")
      .references(() => equipment.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: uniqueIndex("user_favorite_equipments_pk").on(
      table.userId,
      table.equipmentId,
    ),
  }),
);

export const systemSettings = pgTable("system_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  updatedBy: uuid("updated_by").references(() => users.id),
});

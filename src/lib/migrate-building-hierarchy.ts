import "dotenv/config";
import { db } from "@/infrastructure/database/drizzle";
import { sql } from "drizzle-orm";

async function migrate() {
  console.log("Running custom migration...");

  try {
    // Create buildings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "buildings" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "address" text
      );
    `);
    console.log("✓ Created buildings table");

    // Create floors table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "floors" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "building_id" uuid NOT NULL,
        "floor_number" integer
      );
    `);
    console.log("✓ Created floors table");

    // Create rooms table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "rooms" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "floor_id" uuid NOT NULL,
        "capacity" integer
      );
    `);
    console.log("✓ Created rooms table");

    // Add room_id column to equipment table if it doesn't exist
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'equipment' AND column_name = 'room_id'
        ) THEN
          ALTER TABLE "equipment" ADD COLUMN "room_id" uuid;
        END IF;
      END $$;
    `);
    console.log("✓ Added room_id column to equipment table");

    // Add foreign key constraints
    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'equipment_room_id_rooms_id_fk'
        ) THEN
          ALTER TABLE "equipment" 
          ADD CONSTRAINT "equipment_room_id_rooms_id_fk" 
          FOREIGN KEY ("room_id") REFERENCES "public"."rooms"("id") 
          ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log("✓ Added equipment-room foreign key");

    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'floors_building_id_buildings_id_fk'
        ) THEN
          ALTER TABLE "floors" 
          ADD CONSTRAINT "floors_building_id_buildings_id_fk" 
          FOREIGN KEY ("building_id") REFERENCES "public"."buildings"("id") 
          ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log("✓ Added floor-building foreign key");

    await db.execute(sql`
      DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.table_constraints 
          WHERE constraint_name = 'rooms_floor_id_floors_id_fk'
        ) THEN
          ALTER TABLE "rooms" 
          ADD CONSTRAINT "rooms_floor_id_floors_id_fk" 
          FOREIGN KEY ("floor_id") REFERENCES "public"."floors"("id") 
          ON DELETE no action ON UPDATE no action;
        END IF;
      END $$;
    `);
    console.log("✓ Added room-floor foreign key");

    console.log("Migration completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

migrate();

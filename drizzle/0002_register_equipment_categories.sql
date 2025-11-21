CREATE TABLE IF NOT EXISTS "equipment_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_major" text NOT NULL,
  "category_minor" text NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "equipment_categories_major_minor_idx"
  ON "equipment_categories" ("category_major", "category_minor");

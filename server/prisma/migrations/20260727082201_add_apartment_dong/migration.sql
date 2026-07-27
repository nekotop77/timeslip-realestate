-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Apartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "aptSeq" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dong" TEXT NOT NULL DEFAULT '',
    "regionId" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "areaM2" REAL NOT NULL,
    CONSTRAINT "Apartment_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Apartment" ("aptSeq", "areaM2", "id", "lat", "lng", "name", "regionId") SELECT "aptSeq", "areaM2", "id", "lat", "lng", "name", "regionId" FROM "Apartment";
DROP TABLE "Apartment";
ALTER TABLE "new_Apartment" RENAME TO "Apartment";
CREATE UNIQUE INDEX "Apartment_aptSeq_key" ON "Apartment"("aptSeq");
CREATE INDEX "Apartment_regionId_idx" ON "Apartment"("regionId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

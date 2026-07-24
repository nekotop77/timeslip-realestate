/*
  Warnings:

  - Made the column `month` on table `PriceRecord` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PriceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "avgPrice" INTEGER NOT NULL,
    "dealCount" INTEGER,
    CONSTRAINT "PriceRecord_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PriceRecord" ("apartmentId", "avgPrice", "dealCount", "id", "month", "year") SELECT "apartmentId", "avgPrice", "dealCount", "id", "month", "year" FROM "PriceRecord";
DROP TABLE "PriceRecord";
ALTER TABLE "new_PriceRecord" RENAME TO "PriceRecord";
CREATE INDEX "PriceRecord_apartmentId_year_idx" ON "PriceRecord"("apartmentId", "year");
CREATE UNIQUE INDEX "PriceRecord_apartmentId_year_month_key" ON "PriceRecord"("apartmentId", "year", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

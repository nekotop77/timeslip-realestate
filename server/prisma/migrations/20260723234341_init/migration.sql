-- CreateTable
CREATE TABLE "Region" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "lawdCd" TEXT NOT NULL,
    "sido" TEXT NOT NULL,
    "sigungu" TEXT NOT NULL,
    "label" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Apartment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "regionId" TEXT NOT NULL,
    "lat" REAL,
    "lng" REAL,
    "areaM2" REAL NOT NULL,
    CONSTRAINT "Apartment_regionId_fkey" FOREIGN KEY ("regionId") REFERENCES "Region" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PriceRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "apartmentId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER,
    "avgPrice" INTEGER NOT NULL,
    "dealCount" INTEGER,
    CONSTRAINT "PriceRecord_apartmentId_fkey" FOREIGN KEY ("apartmentId") REFERENCES "Apartment" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Region_lawdCd_key" ON "Region"("lawdCd");

-- CreateIndex
CREATE INDEX "Region_sido_idx" ON "Region"("sido");

-- CreateIndex
CREATE INDEX "Apartment_regionId_idx" ON "Apartment"("regionId");

-- CreateIndex
CREATE INDEX "PriceRecord_apartmentId_year_idx" ON "PriceRecord"("apartmentId", "year");

-- CreateIndex
CREATE UNIQUE INDEX "PriceRecord_apartmentId_year_month_key" ON "PriceRecord"("apartmentId", "year", "month");

import { writeFileSync } from "node:fs"
import { prisma } from "../lib/db.js"

interface ExportRow {
  aptSeq: string
  name: string
  dong: string
  areaBand: string
  areaM2: number
  lat: number
  lng: number
  price2016: number | null
  price2026: number | null
}

async function exportRegion(lawdCd: string, outPath: string) {
  const region = await prisma.region.findUnique({ where: { lawdCd } })
  if (!region) throw new Error(`등록되지 않은 법정동코드: ${lawdCd}`)

  const apartments = await prisma.apartment.findMany({
    where: { regionId: region.id, lat: { not: null }, lng: { not: null } },
    include: { priceRecords: true },
  })

  const rows: ExportRow[] = apartments.map((apt) => {
    const p2016 = apt.priceRecords.find((p) => p.year === 2016)
    const p2026 = apt.priceRecords.find((p) => p.year === 2026)
    return {
      aptSeq: apt.aptSeq,
      name: apt.name,
      dong: apt.dong,
      areaBand: apt.areaBand,
      areaM2: apt.areaM2,
      lat: apt.lat!,
      lng: apt.lng!,
      price2016: p2016?.avgPrice ?? null,
      price2026: p2026?.avgPrice ?? null,
    }
  })

  writeFileSync(outPath, JSON.stringify(rows))
  console.log(`${outPath} 에 ${rows.length}개 단지 저장`)
}

exportRegion("11710", "../app/src/data/songpa.json").catch((e) => {
  console.error(e)
  process.exit(1)
})

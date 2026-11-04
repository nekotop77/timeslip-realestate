import { mkdirSync, writeFileSync } from "node:fs"
import { dirname } from "node:path"
import { prisma } from "../lib/db.js"
import { CURRENT_YEAR, PAST_YEAR, PERIOD_LABELS } from "./targets.js"

const OUT_PATH = "../app/public/data/seoul.json"
const EXPORT_SIDO = "서울특별시"

async function main() {
  const apartments = await prisma.apartment.findMany({
    where: { region: { sido: EXPORT_SIDO } },
    include: { priceRecords: true, region: true },
  })
  const located = apartments.filter((apt) => apt.lat !== null && apt.lng !== null)

  const rows = located.map((apt) => ({
    aptSeq: apt.aptSeq,
    name: apt.name,
    sigungu: apt.region.sigungu,
    dong: apt.dong,
    areaBand: apt.areaBand,
    areaM2: apt.areaM2,
    lat: apt.lat!,
    lng: apt.lng!,
    pricePast: apt.priceRecords.find((p) => p.year === PAST_YEAR)?.avgPrice ?? null,
    priceNow: apt.priceRecords.find((p) => p.year === CURRENT_YEAR)?.avgPrice ?? null,
  }))

  // 수집 직후 내보내므로 내보낸 날짜를 수집일로 쓴다 (예: "2026-11-04", sv-SE 로캘이 이 형식).
  const collectedAt = new Date().toLocaleDateString("sv-SE", { timeZone: "Asia/Seoul" })

  mkdirSync(dirname(OUT_PATH), { recursive: true })
  writeFileSync(OUT_PATH, JSON.stringify({ collectedAt, periods: PERIOD_LABELS, rows }))

  console.log(`${OUT_PATH}: ${rows.length}개 저장 (좌표 없어 제외 ${apartments.length - rows.length}개)`)
  const perDistrict = new Map<string, number>()
  for (const r of rows) perDistrict.set(r.sigungu, (perDistrict.get(r.sigungu) ?? 0) + 1)
  console.log([...perDistrict].map(([k, v]) => `${k} ${v}`).join(" · "))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

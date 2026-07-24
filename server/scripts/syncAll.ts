import { LAWD_CODES } from "../prisma/data/lawdCodes.js"
import { fetchAptTrades } from "../services/publicData.js"
import { aggregateByApartment } from "../services/aggregate.js"
import { saveAggregatedApartments } from "../services/persist.js"

// 2026년 7월(당월)은 실거래 신고기한(계약 후 30일) 때문에 데이터가 아직 다 안 들어와서 제외.
const TARGETS = [
  { year: 2016, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] },
  { year: 2026, months: [1, 2, 3, 4, 5, 6] },
]

async function syncRegionYear(lawdCd: string, label: string, year: number, months: number[]) {
  const allItems = []
  for (const m of months) {
    const dealYmd = `${year}${String(m).padStart(2, "0")}`
    const items = await fetchAptTrades(lawdCd, dealYmd)
    allItems.push(...items)
  }

  const aggregated = aggregateByApartment(allItems)
  await saveAggregatedApartments(lawdCd, aggregated)
  console.log(`  ${year}년: 거래 ${allItems.length}건 → 80~85㎡ 단지 ${aggregated.length}개`)
}

async function main() {
  for (const region of LAWD_CODES) {
    console.log(`[${region.label}] (${region.lawdCd})`)
    for (const t of TARGETS) {
      await syncRegionYear(region.lawdCd, region.label, t.year, t.months)
    }
  }
  console.log("전체 동기화 완료")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

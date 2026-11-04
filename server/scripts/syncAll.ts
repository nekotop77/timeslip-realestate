import { LAWD_CODES } from "../prisma/data/lawdCodes.js"
import { fetchAptTrades } from "../services/publicData.js"
import { aggregateByApartment } from "../services/aggregate.js"
import { saveAggregatedApartments } from "../services/persist.js"
import { TARGETS } from "./targets.js"

const SYNC_SIDO = "서울특별시"

async function syncRegionYear(lawdCd: string, year: number, months: number[]) {
  const allItems = []
  for (const m of months) {
    const dealYmd = `${year}${String(m).padStart(2, "0")}`
    const items = await fetchAptTrades(lawdCd, dealYmd)
    allItems.push(...items)
  }

  const aggregated = aggregateByApartment(allItems)
  await saveAggregatedApartments(lawdCd, aggregated)
  console.log(`  ${year}년: 거래 ${allItems.length}건 → 단지·평형 ${aggregated.length}개`)
}

// 사용법: npm run sync             → 서울 전체
//         npm run sync 11110 11140 → 지정한 구만 (실패한 구 재수집용)
async function main() {
  const only = process.argv.slice(2)
  const regions = LAWD_CODES.filter((r) =>
    only.length > 0 ? only.includes(r.lawdCd) : r.sido === SYNC_SIDO,
  )

  const failed: string[] = []
  for (const region of regions) {
    console.log(`[${region.label}] (${region.lawdCd})`)
    try {
      for (const t of TARGETS) {
        await syncRegionYear(region.lawdCd, t.year, t.months)
      }
    } catch (e) {
      console.error(`  실패: ${(e as Error).message}`)
      failed.push(region.lawdCd)
    }
  }

  if (failed.length > 0) {
    console.error(`동기화 실패 ${failed.length}개 구. 재실행: npm run sync ${failed.join(" ")}`)
    process.exit(1)
  }
  console.log(`전체 동기화 완료: ${regions.length}개 구`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})

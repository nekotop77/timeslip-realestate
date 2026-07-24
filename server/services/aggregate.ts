import type { AptTradeItem } from "./publicData.js"

const MIN_AREA = 80
const MAX_AREA = 85

export interface YearlyAverage {
  year: number
  avgPrice: number // 만원 단위
  dealCount: number
}

export interface AggregatedApartment {
  aptSeq: string
  name: string
  dong: string
  sggCd: string
  areaM2: number
  roadAddress: string
  yearly: YearlyAverage[]
}

/** 전용면적 80~85㎡ 거래만 남기고, 단지(aptSeq)별 · 연도별 평균 거래가로 집계 */
export function aggregateByApartment(items: AptTradeItem[]): AggregatedApartment[] {
  const inRange = items.filter((i) => i.excluUseAr >= MIN_AREA && i.excluUseAr <= MAX_AREA)

  const byApt = new Map<string, AptTradeItem[]>()
  for (const item of inRange) {
    const key = item.aptSeq
    if (!byApt.has(key)) byApt.set(key, [])
    byApt.get(key)!.push(item)
  }

  return Array.from(byApt.entries()).map(([aptSeq, trades]) => {
    const byYear = new Map<number, AptTradeItem[]>()
    for (const t of trades) {
      if (!byYear.has(t.dealYear)) byYear.set(t.dealYear, [])
      byYear.get(t.dealYear)!.push(t)
    }

    const yearly: YearlyAverage[] = Array.from(byYear.entries()).map(([year, yearTrades]) => ({
      year,
      avgPrice: Math.round(
        yearTrades.reduce((sum, t) => sum + t.dealAmount, 0) / yearTrades.length,
      ),
      dealCount: yearTrades.length,
    }))

    const first = trades[0]
    const avgArea = trades.reduce((sum, t) => sum + t.excluUseAr, 0) / trades.length

    return {
      aptSeq,
      name: first.aptNm,
      dong: first.umdNm,
      sggCd: first.sggCd,
      areaM2: Math.round(avgArea * 100) / 100,
      roadAddress: `${first.roadNm} ${first.roadNmBonbun}${
        first.roadNmBubun && first.roadNmBubun !== "0" ? `-${first.roadNmBubun}` : ""
      }`.trim(),
      yearly,
    }
  })
}

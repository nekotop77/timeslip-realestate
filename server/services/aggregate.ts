import type { AptTradeItem } from "./publicData.js"

// 전용면적(㎡) 기준 10평(약 33㎡) 단위 구간. 평형은 법적 단위가 아니라 관례적 구분이라
// 10평 폭의 연속 구간으로 단순화했다 (예: "20평대"=33~66㎡).
export const AREA_BANDS = [
  { key: "10", label: "10평대", min: 0, max: 33 },
  { key: "20", label: "20평대", min: 33, max: 66 },
  { key: "30", label: "30평대", min: 66, max: 99 },
  { key: "40", label: "40평대", min: 99, max: Infinity },
] as const

export type AreaBandKey = (typeof AREA_BANDS)[number]["key"]

function bandOf(areaM2: number): AreaBandKey | null {
  return AREA_BANDS.find((b) => areaM2 >= b.min && areaM2 < b.max)?.key ?? null
}

export interface YearlyAverage {
  year: number
  avgPrice: number // 만원 단위
  dealCount: number
}

export interface AggregatedApartment {
  aptSeq: string
  areaBand: AreaBandKey
  name: string
  dong: string
  sggCd: string
  areaM2: number
  roadAddress: string
  yearly: YearlyAverage[]
}

/** 단지(aptSeq) + 평형대(areaBand)별 · 연도별 평균 거래가로 집계 */
export function aggregateByApartment(items: AptTradeItem[]): AggregatedApartment[] {
  const byGroup = new Map<string, AptTradeItem[]>()
  for (const item of items) {
    const band = bandOf(item.excluUseAr)
    if (!band) continue // 음수/이상치 등 방어
    const key = `${item.aptSeq}::${band}`
    if (!byGroup.has(key)) byGroup.set(key, [])
    byGroup.get(key)!.push(item)
  }

  return Array.from(byGroup.entries()).map(([key, trades]) => {
    const [aptSeq, areaBand] = key.split("::") as [string, AreaBandKey]

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
      areaBand,
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

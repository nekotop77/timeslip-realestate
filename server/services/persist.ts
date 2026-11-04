import { prisma } from "../lib/db.js"
import type { AggregatedApartment } from "./aggregate.js"
import { geocodeAddress, type Coords } from "./geocode.js"

/** 도로명주소 → 지번주소 순으로 시도. 빈 도로명으로 조회하면 구 중심 좌표가 잘못 잡히므로 건너뛴다. */
async function geocodeApartment(
  region: { sido: string; sigungu: string },
  apt: AggregatedApartment,
): Promise<Coords | null> {
  const prefix = `${region.sido} ${region.sigungu}`
  const byRoad = apt.roadAddress ? await geocodeAddress(`${prefix} ${apt.roadAddress}`) : null
  return byRoad ?? geocodeAddress(`${prefix} ${apt.jibunAddress}`)
}

/**
 * 집계된 단지 데이터를 Region에 연결해 Apartment/PriceRecord로 upsert.
 * 좌표가 없는 단지만 지오코딩하고, 같은 단지의 다른 평형대에 좌표가 있으면 재사용한다.
 */
export async function saveAggregatedApartments(
  lawdCd: string,
  aggregated: AggregatedApartment[],
) {
  const region = await prisma.region.findUnique({ where: { lawdCd } })
  if (!region) throw new Error(`등록되지 않은 법정동코드: ${lawdCd}`)

  for (const apt of aggregated) {
    const existing = await prisma.apartment.findUnique({
      where: { aptSeq_areaBand: { aptSeq: apt.aptSeq, areaBand: apt.areaBand } },
    })

    let coords: Coords | null = null
    if (existing?.lat == null || existing?.lng == null) {
      const sibling = await prisma.apartment.findFirst({
        where: { aptSeq: apt.aptSeq, lat: { not: null }, lng: { not: null } },
      })
      coords = sibling
        ? { lat: sibling.lat!, lng: sibling.lng! }
        : await geocodeApartment(region, apt)
    }

    const apartment = existing
      ? await prisma.apartment.update({
          where: { id: existing.id },
          data: { name: apt.name, dong: apt.dong, areaM2: apt.areaM2, ...coords },
        })
      : await prisma.apartment.create({
          data: {
            aptSeq: apt.aptSeq,
            areaBand: apt.areaBand,
            name: apt.name,
            dong: apt.dong,
            areaM2: apt.areaM2,
            regionId: region.id,
            ...coords,
          },
        })

    for (const y of apt.yearly) {
      // month: 0 = 연간 평균 레코드 (schema.prisma 주석 참고)
      await prisma.priceRecord.upsert({
        where: {
          apartmentId_year_month: { apartmentId: apartment.id, year: y.year, month: 0 },
        },
        update: { avgPrice: y.avgPrice, dealCount: y.dealCount },
        create: {
          apartmentId: apartment.id,
          year: y.year,
          month: 0,
          avgPrice: y.avgPrice,
          dealCount: y.dealCount,
        },
      })
    }
  }
}

import { prisma } from "../lib/db.js"
import type { AggregatedApartment } from "./aggregate.js"
import { geocodeAddress } from "./geocode.js"

/** 집계된 단지 데이터를 Region에 연결해 Apartment/PriceRecord로 upsert. 신규 단지만 지오코딩한다. */
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

    const apartment = existing
      ? await prisma.apartment.update({
          where: { id: existing.id },
          data: { name: apt.name, dong: apt.dong, areaM2: apt.areaM2 },
        })
      : await prisma.apartment.create({
          data: {
            aptSeq: apt.aptSeq,
            areaBand: apt.areaBand,
            name: apt.name,
            dong: apt.dong,
            areaM2: apt.areaM2,
            regionId: region.id,
            ...(await geocodeAddress(`${region.sido} ${region.sigungu} ${apt.roadAddress}`)),
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

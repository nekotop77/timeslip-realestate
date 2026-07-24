import "dotenv/config"
import { XMLParser } from "fast-xml-parser"

const BASE_URL =
  "https://apis.data.go.kr/1613000/RTMSDataSvcAptTradeDev/getRTMSDataSvcAptTradeDev"

// data.go.kr 게이트웨이가 User-Agent 없는 요청(Node fetch 기본값 포함)을 차단한다.
const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36"

const PAGE_SIZE = 1000

export interface AptTradeItem {
  aptSeq: string
  aptNm: string
  umdNm: string
  jibun: string
  excluUseAr: number
  dealAmount: number // 만원 단위
  dealYear: number
  dealMonth: number
  dealDay: number
  buildYear: number
  roadNm: string
  roadNmBonbun: string
  roadNmBubun: string
  sggCd: string
}

const parser = new XMLParser({
  isArray: (name) => name === "item",
})

function toItem(raw: Record<string, string | number>): AptTradeItem {
  return {
    aptSeq: String(raw.aptSeq).trim(),
    aptNm: String(raw.aptNm).trim(),
    umdNm: String(raw.umdNm).trim(),
    jibun: String(raw.jibun).trim(),
    excluUseAr: Number(raw.excluUseAr),
    dealAmount: Number(String(raw.dealAmount).replace(/,/g, "").trim()),
    dealYear: Number(raw.dealYear),
    dealMonth: Number(raw.dealMonth),
    dealDay: Number(raw.dealDay),
    buildYear: Number(raw.buildYear),
    roadNm: String(raw.roadNm ?? "").trim(),
    roadNmBonbun: String(raw.roadNmBonbun ?? "").trim(),
    roadNmBubun: String(raw.roadNmBubun ?? "").trim(),
    sggCd: String(raw.sggCd).trim(),
  }
}

async function fetchPage(
  lawdCd: string,
  dealYmd: string,
  pageNo: number,
): Promise<{ items: AptTradeItem[]; totalCount: number }> {
  const serviceKey = process.env.PUBLIC_DATA_API_KEY
  if (!serviceKey) throw new Error("PUBLIC_DATA_API_KEY가 설정되지 않았습니다")

  const url = `${BASE_URL}?serviceKey=${serviceKey}&LAWD_CD=${lawdCd}&DEAL_YMD=${dealYmd}&numOfRows=${PAGE_SIZE}&pageNo=${pageNo}`
  const res = await fetch(url, { headers: { "User-Agent": BROWSER_USER_AGENT } })
  const xml = await res.text()
  const parsed = parser.parse(xml)
  const body = parsed?.response?.body
  const header = parsed?.response?.header

  if (Number(header?.resultCode) !== 0) {
    throw new Error(`실거래가 API 오류 [${lawdCd}/${dealYmd}]: ${header?.resultMsg}`)
  }

  const rawItems = body?.items?.item ?? []
  return {
    items: rawItems.map(toItem),
    totalCount: Number(body?.totalCount ?? 0),
  }
}

/** 법정동코드(LAWD_CD)·계약년월(DEAL_YMD, "YYYYMM") 기준 아파트 매매 실거래 전체 건 조회 */
export async function fetchAptTrades(
  lawdCd: string,
  dealYmd: string,
): Promise<AptTradeItem[]> {
  const first = await fetchPage(lawdCd, dealYmd, 1)
  const pages = Math.ceil(first.totalCount / PAGE_SIZE)
  if (pages <= 1) return first.items

  const rest = await Promise.all(
    Array.from({ length: pages - 1 }, (_, i) => fetchPage(lawdCd, dealYmd, i + 2)),
  )
  return [first.items, ...rest.map((p) => p.items)].flat()
}

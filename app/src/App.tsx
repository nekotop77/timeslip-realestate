import { useEffect, useMemo, useState } from "react"
import { Analytics } from "@vercel/analytics/react"
import SeoulSearchMap, { type SeoulData } from "./components/SeoulSearchMap"

// novlive.com은 /timeslip/* 요청을 이 Vercel 프로젝트로 넘겨주는 별도 프로젝트다.
// 그 주소에서는 통계도 /timeslip/_vercel 로 보내야 이 프로젝트(timeslip-house)에 쌓인다.
const ANALYTICS_BASE_PATH = location.hostname === "novlive.com" ? "/timeslip/_vercel" : "/_vercel"

function App() {
  const [data, setData] = useState<SeoulData | null>(null)
  const [dataError, setDataError] = useState(false)

  // 약 수만 행이라 번들에 넣지 않고 첫 화면 이후 따로 받는다.
  useEffect(() => {
    let cancelled = false
    fetch(`${import.meta.env.BASE_URL}data/seoul.json`)
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json() as Promise<SeoulData>
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch(() => {
        if (!cancelled) setDataError(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  // 수집 정보 → 출처 → 기간 순. 좁은 화면에서는 항목 단위로만 줄을 바꾼다.
  const collectionInfo = useMemo(() => {
    if (!data) return []
    const districtCount = new Set(data.rows.map((r) => r.sigungu)).size
    return [
      `최종 수집 ${data.collectedAt.replaceAll("-", ".")}`,
      `서울 ${districtCount}개 구`,
      `단지·평형 ${data.rows.length.toLocaleString()}건`,
      "국토교통부 실거래가 단지별 평균",
      data.periods.past,
      data.periods.current,
    ]
  }, [data])

  return (
    <div className="h-svh w-full flex flex-col">
      <main className="flex-1 min-h-0">
        <SeoulSearchMap data={data} dataError={dataError} />
      </main>
      <footer className="flex-none flex flex-wrap justify-center gap-x-2 border-t border-hairline bg-surface px-4 py-2 text-xs text-muted">
        {collectionInfo.map((item) => (
          <span key={item} className="whitespace-nowrap">
            {item}
          </span>
        ))}
        <span className="whitespace-nowrap">
          문의{" "}
          <a href="mailto:cjsrmatkfkd@gmail.com" className="text-ink underline-offset-2 hover:underline">
            cjsrmatkfkd@gmail.com
          </a>
        </span>
      </footer>
      <Analytics basePath={ANALYTICS_BASE_PATH} />
    </div>
  )
}

export default App

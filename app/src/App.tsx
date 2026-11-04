import { useEffect, useMemo, useState } from "react"
import SeoulSearchMap, { type SeoulData } from "./components/SeoulSearchMap"

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

  const collectionInfo = useMemo(() => {
    if (!data) return null
    const districtCount = new Set(data.rows.map((r) => r.sigungu)).size
    return [
      `최종 수집 ${data.collectedAt.replaceAll("-", ".")}`,
      `서울 ${districtCount}개 구`,
      `단지·평형 ${data.rows.length.toLocaleString()}건`,
    ].join(" · ")
  }, [data])

  return (
    <div className="h-svh w-full flex flex-col">
      <main className="flex-1 min-h-0">
        <SeoulSearchMap data={data} dataError={dataError} />
      </main>
      <footer className="flex-none border-t border-line bg-surface px-4 py-2 text-center text-[11px] text-silver">
        {collectionInfo && <span className="inline-block mr-3">{collectionInfo}</span>}
        <span className="inline-block">
          문의{" "}
          <a href="mailto:cjsrmatkfkd@gmail.com" className="text-white underline-offset-2 hover:underline">
            cjsrmatkfkd@gmail.com
          </a>
        </span>
      </footer>
    </div>
  )
}

export default App

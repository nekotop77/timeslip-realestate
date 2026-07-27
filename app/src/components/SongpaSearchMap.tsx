import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"
import songpaData from "../data/songpa.json"
import { formatManwon } from "../lib/formatPrice"
import { PIN_ICON, PIN_SIZE } from "../lib/mapPins"

interface ApartmentRow {
  aptSeq: string
  name: string
  dong: string
  areaBand: string
  areaM2: number
  lat: number
  lng: number
  price2016: number | null // 만원
  price2026: number | null // 만원
}

type YearTab = "past" | "now"

const SONGPA_CENTER = { lat: 37.5013, lng: 127.1123 }
const TAB_LABEL: Record<YearTab, string> = { past: "10년전", now: "현재" }
const AREA_BANDS = [
  { key: "10", label: "10평대" },
  { key: "20", label: "20평대" },
  { key: "30", label: "30평대" },
  { key: "40", label: "40평대" },
]

export default function SongpaSearchMap() {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
  })
  const [activeTab, setActiveTab] = useState<YearTab>("past")
  const [activeBand, setActiveBand] = useState("30")
  const [budgetInput, setBudgetInput] = useState("5")
  const [budgetEok, setBudgetEok] = useState<number | null>(5)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)

  const syncSize = () => {
    const map = mapRef.current
    if (!map) return
    map.relayout()
    map.setCenter(map.getCenter())
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(syncSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const results = useMemo(() => {
    if (budgetEok === null) return []
    const budgetManwon = budgetEok * 10000
    return (songpaData as ApartmentRow[])
      .filter((a) => a.areaBand === activeBand)
      .map((a) => {
        const anchorPrice = activeTab === "past" ? a.price2016 : a.price2026
        const otherPrice = activeTab === "past" ? a.price2026 : a.price2016
        return { ...a, anchorPrice, matchesBoth: otherPrice !== null && otherPrice <= budgetManwon }
      })
      .filter((a) => a.anchorPrice !== null && a.anchorPrice <= budgetManwon)
  }, [budgetEok, activeTab, activeBand])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const n = Number(budgetInput)
    setBudgetEok(Number.isFinite(n) && n > 0 ? n : null)
    setActiveKey(null)
  }

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {error && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-over-budget px-6 text-center">
          카카오맵 로드 실패 — API 키/도메인 등록을 확인해주세요.
        </p>
      )}
      {!error && !loading && (
        <Map
          center={SONGPA_CENTER}
          style={{ width: "100%", height: "100%" }}
          level={6}
          onCreate={(map) => {
            mapRef.current = map
            syncSize()
          }}
        >
          {results.map((apt) => {
            const key = apt.aptSeq
            return (
              <MapMarker
                key={key}
                position={{ lat: apt.lat, lng: apt.lng }}
                image={{
                  src: apt.matchesBoth ? PIN_ICON.blue : PIN_ICON.red,
                  size: PIN_SIZE,
                }}
                onClick={() => setActiveKey(key)}
              >
                {activeKey === key && (
                  <div className="p-1.5 text-xs text-black whitespace-nowrap">
                    <strong>{apt.name}</strong> ({apt.dong})
                    <br />
                    10년전: {apt.price2016 !== null ? formatManwon(apt.price2016) : "거래 데이터 없음"} · 현재:{" "}
                    {apt.price2026 !== null ? formatManwon(apt.price2026) : "거래 데이터 없음"}
                  </div>
                )}
              </MapMarker>
            )
          })}
        </Map>
      )}

      <div className="absolute top-4 left-4 z-10 w-60 rounded-lg bg-surface/95 border border-line p-3 shadow-heavy">
        <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-now mb-2">
          TimeSlip · 송파구
        </p>
        <div className="flex gap-1.5 mb-3">
          {(["past", "now"] as YearTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${
                activeTab === tab ? "bg-now text-black" : "bg-elevated text-silver"
              }`}
            >
              {TAB_LABEL[tab]}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 mb-3">
          {AREA_BANDS.map((band) => (
            <button
              key={band.key}
              type="button"
              onClick={() => setActiveBand(band.key)}
              className={`flex-1 text-[11px] font-bold py-1 rounded-full transition-colors ${
                activeBand === band.key ? "bg-white text-black" : "bg-elevated text-silver"
              }`}
            >
              {band.label}
            </button>
          ))}
        </div>
        <form onSubmit={handleSearch} className="flex gap-1.5">
          <div className="flex-1 flex items-center bg-elevated rounded-full px-3">
            <input
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              inputMode="decimal"
              placeholder="예산"
              className="w-full bg-transparent text-sm text-white placeholder:text-silver py-2 outline-none"
            />
            <span className="text-xs text-silver">억</span>
          </div>
          <button
            type="submit"
            className="px-4 rounded-full bg-now text-black text-sm font-bold"
          >
            검색
          </button>
        </form>
        {budgetEok !== null && (
          <p className="text-[11px] text-silver mt-2">
            {TAB_LABEL[activeTab]} {budgetEok}억 기준 {results.length}곳 ·{" "}
            <span className="text-info">
              {activeTab === "past" ? "현재도" : "10년전에도"} 가능 {results.filter((r) => r.matchesBoth).length}
            </span>
          </p>
        )}
      </div>
    </div>
  )
}

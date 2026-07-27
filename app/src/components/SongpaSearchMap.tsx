import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"
import songpaData from "../data/songpa.json"
import { formatManwon } from "../lib/formatPrice"
import { PIN_ICON, PIN_SIZE } from "../lib/mapPins"
import LogoMark from "./LogoMark"

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

interface Pin extends ApartmentRow {
  pinKey: string
  colorType: "past" | "now"
}

const SONGPA_CENTER = { lat: 37.5013, lng: 127.1123 }
const AREA_BANDS = [
  { key: "10", label: "10평대" },
  { key: "20", label: "20평대" },
  { key: "30", label: "30평대" },
  { key: "40", label: "40평대" },
]

/** price(만원)가 "N억대"(N.0억~N.9억)에 속하는지 */
function inEokBand(price: number | null, bandEok: number): boolean {
  if (price === null) return false
  return Math.floor(price / 10000) === bandEok
}

export default function SongpaSearchMap() {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
  })
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

  const pins = useMemo<Pin[]>(() => {
    if (budgetEok === null) return []
    const inBand = (a: ApartmentRow) => a.areaBand === activeBand

    const pastPins: Pin[] = (songpaData as ApartmentRow[])
      .filter((a) => inBand(a) && inEokBand(a.price2016, budgetEok))
      .map((a) => ({ ...a, pinKey: `${a.aptSeq}-past`, colorType: "past" as const }))

    const nowPins: Pin[] = (songpaData as ApartmentRow[])
      .filter((a) => inBand(a) && inEokBand(a.price2026, budgetEok))
      .map((a) => ({ ...a, pinKey: `${a.aptSeq}-now`, colorType: "now" as const }))

    return [...pastPins, ...nowPins]
  }, [budgetEok, activeBand])

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const n = Math.floor(Number(budgetInput))
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
          {pins.map((pin) => (
            <MapMarker
              key={pin.pinKey}
              position={{ lat: pin.lat, lng: pin.lng }}
              image={{ src: PIN_ICON[pin.colorType], size: PIN_SIZE }}
              onClick={() => setActiveKey(pin.pinKey)}
            >
              {activeKey === pin.pinKey && (
                <div className="p-1.5 text-xs text-black whitespace-nowrap">
                  <strong>{pin.name}</strong> ({pin.dong})
                  <br />
                  10년전: {pin.price2016 !== null ? formatManwon(pin.price2016) : "거래 데이터 없음"} · 현재:{" "}
                  {pin.price2026 !== null ? formatManwon(pin.price2026) : "거래 데이터 없음"}
                </div>
              )}
            </MapMarker>
          ))}
        </Map>
      )}

      <div className="absolute top-4 left-4 z-10 w-60 rounded-lg bg-surface/95 border border-line p-3 shadow-heavy">
        <div className="flex items-center gap-1.5 mb-3">
          <LogoMark className="w-4 h-auto text-white flex-none" />
          <p className="text-[11px] font-bold tracking-[1.5px] uppercase text-now">
            TimeSlip · 송파구
          </p>
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
              inputMode="numeric"
              placeholder="예산"
              className="w-full bg-transparent text-sm text-white placeholder:text-silver py-2 outline-none"
            />
            <span className="text-xs text-silver">억대</span>
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
            {budgetEok}억대 검색 · 과거 {pins.filter((p) => p.colorType === "past").length}곳 · 현재{" "}
            {pins.filter((p) => p.colorType === "now").length}곳
          </p>
        )}

        <div className="flex items-center gap-3 mt-3 pt-2 border-t border-line">
          <div className="flex items-center gap-1.5 text-[11px] text-silver">
            <span className="w-2.5 h-2.5 rounded-full bg-[#9aa0a6]" />
            과거 가격대
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-silver">
            <span className="w-2.5 h-2.5 rounded-full bg-info" />
            현재 가격대
          </div>
        </div>
      </div>
    </div>
  )
}

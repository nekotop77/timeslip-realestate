import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Map, MapMarker, MarkerClusterer, useKakaoLoader } from "react-kakao-maps-sdk"
import { formatManwon } from "../lib/formatPrice"
import { CLUSTER_STYLES, PIN_ICON, PIN_SIZE } from "../lib/mapPins"

export interface ApartmentRow {
  aptSeq: string
  name: string
  sigungu: string
  dong: string
  areaBand: string
  areaM2: number
  lat: number
  lng: number
  pricePast: number | null // 만원
  priceNow: number | null // 만원
}

export interface SeoulData {
  collectedAt: string // "YYYY-MM-DD"
  periods: { past: string; current: string }
  rows: ApartmentRow[]
}

const ALL_DISTRICTS = "전체"

interface Pin extends ApartmentRow {
  pinKey: string
  colorType: "past" | "now"
}

const SEOUL_CENTER = { lat: 37.5565, lng: 126.9880 }
const SEOUL_LEVEL = 9
// 이 레벨 이상으로 축소하면 핀을 묶어서 표시한다.
const CLUSTER_MIN_LEVEL = 7

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

export default function SeoulSearchMap({
  data,
  dataError,
}: {
  data: SeoulData | null
  dataError: boolean
}) {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
    libraries: ["clusterer"],
  })
  const [district, setDistrict] = useState(ALL_DISTRICTS)
  const [activeBand, setActiveBand] = useState("30")
  const [budgetInput, setBudgetInput] = useState("5")
  const [budgetEok, setBudgetEok] = useState<number | null>(5)
  const [activeKey, setActiveKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)

  const lastSizeRef = useRef({ width: 0, height: 0 })

  // 지도는 크기가 바뀌면 좌상단을 고정한 채 늘어나므로, 원래 중심은 이전 크기의 절반 위치에 남아 있다.
  // 카카오맵이 창 크기 변경을 먼저 처리하기도 해서 getCenter()는 이미 어긋난 값일 수 있어 쓰지 않는다.
  const syncSize = () => {
    const map = mapRef.current
    const el = containerRef.current
    if (!map || !el) return
    const width = el.clientWidth
    const height = el.clientHeight
    if (width === 0 || height === 0) return
    const last = lastSizeRef.current
    if (last.width === width && last.height === height) return
    map.relayout()
    const previousCenter = new kakao.maps.Point(last.width / 2, last.height / 2)
    map.setCenter(map.getProjection().coordsFromContainerPoint(previousCenter))
    lastSizeRef.current = { width, height }
  }

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(syncSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const districts = useMemo(
    () => [...new Set(data?.rows.map((r) => r.sigungu))].sort((a, b) => a.localeCompare(b, "ko")),
    [data],
  )

  const { pastPins, nowPins } = useMemo<{ pastPins: Pin[]; nowPins: Pin[] }>(() => {
    if (budgetEok === null || !data) return { pastPins: [], nowPins: [] }
    const candidates = data.rows.filter(
      (a) => a.areaBand === activeBand && (district === ALL_DISTRICTS || a.sigungu === district),
    )
    return {
      pastPins: candidates
        .filter((a) => inEokBand(a.pricePast, budgetEok))
        .map((a) => ({ ...a, pinKey: `${a.aptSeq}-past`, colorType: "past" as const })),
      nowPins: candidates
        .filter((a) => inEokBand(a.priceNow, budgetEok))
        .map((a) => ({ ...a, pinKey: `${a.aptSeq}-now`, colorType: "now" as const })),
    }
  }, [budgetEok, activeBand, district, data])

  function handleDistrictChange(next: string) {
    setDistrict(next)
    setActiveKey(null)
    const map = mapRef.current
    if (!map || !data) return
    if (next === ALL_DISTRICTS) {
      map.setLevel(SEOUL_LEVEL)
      map.setCenter(new kakao.maps.LatLng(SEOUL_CENTER.lat, SEOUL_CENTER.lng))
      return
    }
    const bounds = new kakao.maps.LatLngBounds()
    for (const r of data.rows) {
      if (r.sigungu === next) bounds.extend(new kakao.maps.LatLng(r.lat, r.lng))
    }
    map.setBounds(bounds)
  }

  function renderMarker(pin: Pin) {
    return (
      <MapMarker
        key={pin.pinKey}
        position={{ lat: pin.lat, lng: pin.lng }}
        image={{ src: PIN_ICON[pin.colorType], size: PIN_SIZE }}
        onClick={() => setActiveKey(pin.pinKey)}
      >
        {activeKey === pin.pinKey && (
          <div className="px-3 py-2 text-xs leading-relaxed text-bubble-ink whitespace-nowrap">
            <p>
              <span className="font-medium">{pin.name}</span>{" "}
              <span className="text-bubble-muted">
                {pin.sigungu} {pin.dong}
              </span>
            </p>
            <p className="flex gap-3">
              <PriceTag type="past" value={pin.pricePast !== null ? formatManwon(pin.pricePast) : "—"} />
              <PriceTag type="now" value={pin.priceNow !== null ? formatManwon(pin.priceNow) : "—"} />
            </p>
          </div>
        )}
      </MapMarker>
    )
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const n = Math.floor(Number(budgetInput))
    setBudgetEok(Number.isFinite(n) && n > 0 ? n : null)
    setActiveKey(null)
  }

  const ready = data !== null && budgetEok !== null
  const results = [
    { type: "past" as const, period: data?.periods.past, count: pastPins.length },
    { type: "now" as const, period: data?.periods.current, count: nowPins.length },
  ]

  return (
    <div ref={containerRef} className="relative w-full h-full">
      {error && (
        <p className="absolute inset-0 flex items-center justify-center text-sm text-error px-6 text-center">
          카카오맵 로드 실패 — API 키/도메인 등록을 확인해주세요.
        </p>
      )}
      {!error && !loading && (
        <Map
          center={SEOUL_CENTER}
          style={{ width: "100%", height: "100%" }}
          level={SEOUL_LEVEL}
          onCreate={(map) => {
            mapRef.current = map
            lastSizeRef.current = {
              width: containerRef.current?.clientWidth ?? 0,
              height: containerRef.current?.clientHeight ?? 0,
            }
            syncSize()
          }}
        >
          {/* 과거/현재 색 구분이 묶음에서도 유지되도록 클러스터러를 따로 둔다.
              key로 다시 만들면 이전 묶음이 지도에 남으므로, 핀만 교체한다. */}
          <MarkerClusterer averageCenter minLevel={CLUSTER_MIN_LEVEL} styles={CLUSTER_STYLES.past}>
            {pastPins.map(renderMarker)}
          </MarkerClusterer>
          <MarkerClusterer averageCenter minLevel={CLUSTER_MIN_LEVEL} styles={CLUSTER_STYLES.now}>
            {nowPins.map(renderMarker)}
          </MarkerClusterer>
        </Map>
      )}

      <div className="absolute top-4 left-4 z-10 w-64 flex flex-col gap-3 rounded-2xl border border-hairline bg-surface p-4 text-ink">
        <h1 className="text-sm font-bold">TimeSlip</h1>

        {/* 브라우저 기본 화살표는 여백을 무시하는 경우가 있어(사파리) 직접 그린다. */}
        <div className="relative">
          <select
            value={district}
            onChange={(e) => handleDistrictChange(e.target.value)}
            aria-label="지역"
            className="w-full appearance-none rounded border border-hairline bg-surface py-2 pl-3 pr-9 text-sm"
          >
            <option value={ALL_DISTRICTS}>서울 전체</option>
            {districts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
          <svg
            aria-hidden="true"
            viewBox="0 0 12 12"
            className="pointer-events-none absolute right-3 top-1/2 size-3 -translate-y-1/2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" />
          </svg>
        </div>

        <div className="flex gap-2">
          {AREA_BANDS.map((band) => (
            <button
              key={band.key}
              type="button"
              aria-pressed={activeBand === band.key}
              onClick={() => setActiveBand(band.key)}
              className={`flex-1 rounded-full border py-1 text-xs font-medium transition-colors ${
                activeBand === band.key
                  ? "border-primary bg-primary text-on-primary"
                  : "border-hairline text-ink hover:border-primary"
              }`}
            >
              {band.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <label className="flex-1 flex items-center rounded border border-hairline px-3 focus-within:border-primary">
            <input
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
              inputMode="numeric"
              aria-label="예산"
              className="w-full min-w-0 bg-transparent py-2 text-sm outline-none"
            />
            <span className="flex-none text-sm text-muted">억대</span>
          </label>
          <button type="submit" className="rounded-full bg-primary px-4 text-sm font-medium text-on-primary">
            검색
          </button>
        </form>

        {dataError ? (
          <p className="text-xs text-error">가격 데이터를 불러오지 못했습니다.</p>
        ) : (
          <ul className="flex flex-col gap-2 border-t border-hairline pt-3 text-sm tabular-nums">
            {results.map((r) => (
              <li key={r.type} className="flex items-center justify-between">
                <PriceTag type={r.type} value={r.period ?? "—"} />
                <span>{ready ? `${r.count.toLocaleString()}곳` : "—"}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

/** 과거(회색)/현재(파랑) 색 점 + 값. 범례 대신 색 자체로 구분한다. */
function PriceTag({ type, value }: { type: "past" | "now"; value: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`size-2 rounded-full ${type === "past" ? "bg-past" : "bg-now"}`} />
      {value}
    </span>
  )
}

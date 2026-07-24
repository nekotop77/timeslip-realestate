import { useEffect, useRef } from "react"
import { Map, MapMarker, useKakaoLoader } from "react-kakao-maps-sdk"
import { formatManwon } from "../lib/formatPrice"

// 실거래가 API로 확인한 송파구 실제 동(잠실동/송파동/가락동) 근사 좌표.
// 정확한 단지별 좌표는 Week 1 지오코딩 단계에서 교체 예정 — 지금은 지도 연동 확인용 샘플.
const SAMPLE_APARTMENTS = [
  { name: "주공아파트 5단지", dong: "잠실동", lat: 37.5133, lng: 127.1, price2016: 62000, price2026: 335500 },
  { name: "가락삼익맨숀", dong: "송파동", lat: 37.5013, lng: 127.1123, price2016: 48000, price2026: 180600 },
  { name: "현대(6차)", dong: "가락동", lat: 37.4935, lng: 127.1183, price2016: 32000, price2026: 108000 },
]

export default function MapPreview() {
  const [loading, error] = useKakaoLoader({
    appkey: import.meta.env.VITE_KAKAO_MAP_KEY,
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<kakao.maps.Map | null>(null)

  // relayout()만으로는 새로 넓어진 영역의 타일을 다시 안 그려서,
  // 중심 좌표를 재설정해 강제로 다시 그리게 한다.
  const syncSize = () => {
    const map = mapRef.current
    if (!map) return
    map.relayout()
    map.setCenter(map.getCenter())
  }

  // 부모가 flex로 크기를 나눠주는 풀스크린 레이아웃이라, 카카오맵이 처음 그려질 때
  // 컨테이너 크기를 못 잡는 경우가 있어 크기 변화를 감지해 다시 계산한다.
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(syncSize)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  if (error) {
    return (
      <p className="text-sm text-over-budget px-6 text-center">
        카카오맵 로드 실패 — API 키/도메인 등록을 확인해주세요.
      </p>
    )
  }
  if (loading) {
    return <p className="text-sm text-silver">지도 불러오는 중...</p>
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <Map
        center={{ lat: 37.5013, lng: 127.1123 }}
        style={{ width: "100%", height: "100%" }}
        level={6}
        onCreate={(map) => {
          mapRef.current = map
          syncSize()
        }}
      >
        {SAMPLE_APARTMENTS.map((apt) => (
          <MapMarker key={apt.name} position={{ lat: apt.lat, lng: apt.lng }}>
            <div className="p-1.5 text-xs text-black whitespace-nowrap">
              <strong>{apt.name}</strong> ({apt.dong})
              <br />
              2016: {formatManwon(apt.price2016)} → 2026: {formatManwon(apt.price2026)}
            </div>
          </MapMarker>
        ))}
      </Map>
    </div>
  )
}

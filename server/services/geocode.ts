import "dotenv/config"

const ADDRESS_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/address.json"

export interface Coords {
  lat: number
  lng: number
}

/** 카카오 로컬 주소검색으로 도로명주소 → 위도/경도. 매칭 실패 시 null. */
export async function geocodeAddress(address: string): Promise<Coords | null> {
  const key = process.env.KAKAO_REST_API_KEY
  if (!key) throw new Error("KAKAO_REST_API_KEY가 설정되지 않았습니다")

  const res = await fetch(`${ADDRESS_SEARCH_URL}?query=${encodeURIComponent(address)}`, {
    headers: { Authorization: `KakaoAK ${key}` },
  })
  if (!res.ok) {
    throw new Error(`카카오 지오코딩 오류 [${address}]: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  const doc = data?.documents?.[0]
  if (!doc) return null

  return { lat: Number(doc.y), lng: Number(doc.x) }
}

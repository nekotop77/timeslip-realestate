// 법정동코드(LAWD_CD) 매핑 — MVP 핵심 시나리오 범위로 한정
// 국토교통부 아파트매매 실거래자료 API의 LAWD_CD 파라미터(5자리 시군구 코드)로 사용
//
// 2026-07-24 실제 API(getRTMSDataSvcAptTradeDev) 호출로 전수 검증 완료.
// 인천은 최근 행정구역 개편으로 "서구"가 검단구/서해구/영종구 등으로 분리되어,
// code.go.kr 법정동코드목록조회에서 신설 구를 확인 후 검단구(신도시, 대단지)로 선정.
export const LAWD_CODES = [
  { lawdCd: "11710", sido: "서울특별시", sigungu: "송파구", label: "서울 송파구" },
  { lawdCd: "11440", sido: "서울특별시", sigungu: "마포구", label: "서울 마포구" },
  { lawdCd: "41210", sido: "경기도", sigungu: "광명시", label: "경기 광명시" },
  { lawdCd: "41390", sido: "경기도", sigungu: "시흥시", label: "경기 시흥시" },
  { lawdCd: "28290", sido: "인천광역시", sigungu: "검단구", label: "인천 검단구" },
] as const;

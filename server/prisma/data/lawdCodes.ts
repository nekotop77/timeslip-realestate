// 법정동코드(LAWD_CD) 매핑 — 서울 25개 구 전체 + 수도권 일부
// 국토교통부 아파트매매 실거래자료 API의 LAWD_CD 파라미터(5자리 시군구 코드)로 사용
//
// 2026-07-24 실제 API(getRTMSDataSvcAptTradeDev) 호출로 전수 검증 완료.
// 인천은 최근 행정구역 개편으로 "서구"가 검단구/서해구/영종구 등으로 분리되어,
// code.go.kr 법정동코드목록조회에서 신설 구를 확인 후 검단구(신도시, 대단지)로 선정.
export const LAWD_CODES = [
  { lawdCd: "11110", sido: "서울특별시", sigungu: "종로구", label: "서울 종로구" },
  { lawdCd: "11140", sido: "서울특별시", sigungu: "중구", label: "서울 중구" },
  { lawdCd: "11170", sido: "서울특별시", sigungu: "용산구", label: "서울 용산구" },
  { lawdCd: "11200", sido: "서울특별시", sigungu: "성동구", label: "서울 성동구" },
  { lawdCd: "11215", sido: "서울특별시", sigungu: "광진구", label: "서울 광진구" },
  { lawdCd: "11230", sido: "서울특별시", sigungu: "동대문구", label: "서울 동대문구" },
  { lawdCd: "11260", sido: "서울특별시", sigungu: "중랑구", label: "서울 중랑구" },
  { lawdCd: "11290", sido: "서울특별시", sigungu: "성북구", label: "서울 성북구" },
  { lawdCd: "11305", sido: "서울특별시", sigungu: "강북구", label: "서울 강북구" },
  { lawdCd: "11320", sido: "서울특별시", sigungu: "도봉구", label: "서울 도봉구" },
  { lawdCd: "11350", sido: "서울특별시", sigungu: "노원구", label: "서울 노원구" },
  { lawdCd: "11380", sido: "서울특별시", sigungu: "은평구", label: "서울 은평구" },
  { lawdCd: "11410", sido: "서울특별시", sigungu: "서대문구", label: "서울 서대문구" },
  { lawdCd: "11440", sido: "서울특별시", sigungu: "마포구", label: "서울 마포구" },
  { lawdCd: "11470", sido: "서울특별시", sigungu: "양천구", label: "서울 양천구" },
  { lawdCd: "11500", sido: "서울특별시", sigungu: "강서구", label: "서울 강서구" },
  { lawdCd: "11530", sido: "서울특별시", sigungu: "구로구", label: "서울 구로구" },
  { lawdCd: "11545", sido: "서울특별시", sigungu: "금천구", label: "서울 금천구" },
  { lawdCd: "11560", sido: "서울특별시", sigungu: "영등포구", label: "서울 영등포구" },
  { lawdCd: "11590", sido: "서울특별시", sigungu: "동작구", label: "서울 동작구" },
  { lawdCd: "11620", sido: "서울특별시", sigungu: "관악구", label: "서울 관악구" },
  { lawdCd: "11650", sido: "서울특별시", sigungu: "서초구", label: "서울 서초구" },
  { lawdCd: "11680", sido: "서울특별시", sigungu: "강남구", label: "서울 강남구" },
  { lawdCd: "11710", sido: "서울특별시", sigungu: "송파구", label: "서울 송파구" },
  { lawdCd: "11740", sido: "서울특별시", sigungu: "강동구", label: "서울 강동구" },
  { lawdCd: "41210", sido: "경기도", sigungu: "광명시", label: "경기 광명시" },
  { lawdCd: "41390", sido: "경기도", sigungu: "시흥시", label: "경기 시흥시" },
  { lawdCd: "28290", sido: "인천광역시", sigungu: "검단구", label: "인천 검단구" },
] as const;

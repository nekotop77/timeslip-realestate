// 수집 기간. 비교 기준을 바꿀 때는 이 파일만 고치면 된다.
// 현재 2026-11: 당월은 거래가 거의 없어 제외한다. 10월 계약분은 신고기한(계약 후 30일)이
// 11월 말까지라 아직 일부만 반영돼 있으므로, 11월 말 이후 다시 수집하면 값이 보강된다.
export const PAST_YEAR = 2016
export const CURRENT_YEAR = 2026
const CURRENT_LAST_MONTH = 10

const range = (last: number) => Array.from({ length: last }, (_, i) => i + 1)

export const TARGETS = [
  { year: PAST_YEAR, months: range(12) },
  { year: CURRENT_YEAR, months: range(CURRENT_LAST_MONTH) },
]

export const PERIOD_LABELS = {
  past: `${PAST_YEAR}년 1~12월`,
  current: `${CURRENT_YEAR}년 1~${CURRENT_LAST_MONTH}월`,
}

/** 만원 단위 금액을 "3억 5,500만원" 형식의 한국식 표기로 변환 */
export function formatManwon(manwon: number): string {
  const eok = Math.floor(manwon / 10000)
  const rest = manwon % 10000

  if (eok > 0 && rest > 0) return `${eok}억 ${rest.toLocaleString()}만원`
  if (eok > 0) return `${eok}억`
  return `${rest.toLocaleString()}만원`
}

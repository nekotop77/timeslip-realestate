function pinSvg(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">` +
    `<path d="M14 0C6.3 0 0 6.3 0 14c0 10 14 22 14 22s14-12 14-22C28 6.3 21.7 0 14 0z" fill="${color}"/>` +
    `<circle cx="14" cy="14" r="6" fill="#fff"/>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// 파란색 = 10년전·현재 둘 다 예산 내, 빨간색 = 10년전엔 됐지만 지금은 예산 초과
export const PIN_ICON = {
  blue: pinSvg("#539df5"),
  red: pinSvg("#f3727f"),
}

export const PIN_SIZE = { width: 28, height: 36 }

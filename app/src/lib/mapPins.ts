function pinSvg(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">` +
    `<path d="M14 0C6.3 0 0 6.3 0 14c0 10 14 22 14 22s14-12 14-22C28 6.3 21.7 0 14 0z" fill="${color}"/>` +
    `<circle cx="14" cy="14" r="6" fill="#fff"/>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

// 회색 = 과거(10년전) 가격대 매칭, 파란색 = 현재 가격대 매칭
export const PIN_ICON = {
  past: pinSvg("#9aa0a6"),
  now: pinSvg("#539df5"),
}

export const PIN_SIZE = { width: 28, height: 36 }

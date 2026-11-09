// 과거(10년전) = 회색, 현재 = 파랑. src/index.css의 --color-past / --color-now와 같은 값.
export const PIN_COLOR = {
  past: "#75758a",
  now: "#1863dc",
} as const

function pinSvg(color: string): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="36" viewBox="0 0 28 36">` +
    `<path d="M14 0C6.3 0 0 6.3 0 14c0 10 14 22 14 22s14-12 14-22C28 6.3 21.7 0 14 0z" fill="${color}"/>` +
    `<circle cx="14" cy="14" r="6" fill="#fff"/>` +
    `</svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

export const PIN_ICON = {
  past: pinSvg(PIN_COLOR.past),
  now: pinSvg(PIN_COLOR.now),
}

export const PIN_SIZE = { width: 28, height: 36 }

function clusterStyle(color: string) {
  return [
    {
      width: "38px",
      height: "38px",
      lineHeight: "38px",
      borderRadius: "50%",
      background: color,
      border: "2px solid #fff",
      color: "#fff",
      fontSize: "12px",
      fontWeight: "600",
      textAlign: "center",
    },
  ]
}

export const CLUSTER_STYLES = {
  past: clusterStyle(PIN_COLOR.past),
  now: clusterStyle(PIN_COLOR.now),
}

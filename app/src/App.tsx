import MapPreview from "./components/MapPreview"

function App() {
  return (
    <div className="h-svh flex flex-col">
      <div className="flex-none text-center py-4">
        <p className="text-xs font-bold tracking-[2px] uppercase text-now">TimeSlip Real Estate</p>
        <h1 className="text-2xl font-extrabold">타임슬립 집값</h1>
        <p className="text-sm text-silver mt-1">
          카카오맵 연동 미리보기 — 송파구 샘플 3곳
        </p>
      </div>
      <div className="flex-1 min-h-0">
        <MapPreview />
      </div>
    </div>
  )
}

export default App

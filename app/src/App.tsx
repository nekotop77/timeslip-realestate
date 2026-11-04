import SeoulSearchMap from "./components/SeoulSearchMap"

function App() {
  return (
    <div className="h-svh w-full flex flex-col">
      <main className="flex-1 min-h-0">
        <SeoulSearchMap />
      </main>
      <footer className="flex-none border-t border-line bg-surface px-4 py-2 text-center text-[11px] text-silver">
        문의{" "}
        <a href="mailto:cjsrmatkfkd@gmail.com" className="text-white underline-offset-2 hover:underline">
          cjsrmatkfkd@gmail.com
        </a>
      </footer>
    </div>
  )
}

export default App

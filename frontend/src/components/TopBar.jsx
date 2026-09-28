export default function TopBar({ trackCount, clipCount, bitCount }) {
  return (
    <header className="border-b border-line/80 bg-ink-deep/60 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-5">
        <div className="flex items-baseline gap-3">
          <h1 className="font-display text-3xl font-semibold tracking-wide text-paper">
            Music Muse
          </h1>
          <span className="hidden font-mono text-xs text-mist sm:inline">
            sample · shape · render
          </span>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-line px-4 py-1.5 font-mono text-xs text-mist">
          <Stat label="tracks" value={trackCount} />
          <Divider />
          <Stat label="clips" value={clipCount} />
          <Divider />
          <Stat label="bits" value={bitCount} />
        </div>
      </div>
    </header>
  );
}

function Stat({ label, value }) {
  return (
    <span>
      <span className="text-brass-bright">{value}</span> {label}
    </span>
  );
}

function Divider() {
  return <span className="text-line">/</span>;
}

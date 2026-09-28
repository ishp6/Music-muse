import { useState } from "react";

export default function MixRack({
  clips,
  mixIds,
  onReorder,
  onRemove,
  onRender,
  rendering,
}) {
  const [title, setTitle] = useState("");
  const [crossfade, setCrossfade] = useState(0.4);

  const mixClips = mixIds
    .map((id) => clips.find((c) => c.id === id))
    .filter(Boolean);

  const move = (index, dir) => {
    const next = index + dir;
    if (next < 0 || next >= mixIds.length) return;
    const reordered = [...mixIds];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    onReorder(reordered);
  };

  const totalDuration = mixClips.reduce(
    (sum, c, i) =>
      sum + c.duration - (i > 0 ? Math.min(crossfade, c.duration) : 0),
    0
  );

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      {mixClips.length === 0 ? (
        <p className="text-sm text-mist">
          Add clips from the bin above to build a sequence, then render it into
          a new music bit.
        </p>
      ) : (
        <ol className="space-y-2">
          {mixClips.map((clip, i) => (
            <li
              key={clip.id}
              className="flex items-center gap-3 rounded-md border border-line bg-ink-deep/50 px-3 py-2"
            >
              <span className="font-mono text-xs text-brass">{i + 1}</span>
              <span className="flex-1 truncate text-sm text-paper">
                {clip.name}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <IconButton onClick={() => move(i, -1)} disabled={i === 0} label="Move earlier">
                  ↑
                </IconButton>
                <IconButton
                  onClick={() => move(i, 1)}
                  disabled={i === mixClips.length - 1}
                  label="Move later"
                >
                  ↓
                </IconButton>
                <IconButton onClick={() => onRemove(clip.id)} label="Remove from mix" tone="ember">
                  ✕
                </IconButton>
              </div>
            </li>
          ))}
        </ol>
      )}

      <div className="mt-5 grid gap-4 border-t border-line pt-4 sm:grid-cols-[1fr_auto_auto]">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title this music bit"
          className="rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-mist focus:border-brass focus:outline-none"
        />
        <div className="flex items-center gap-2">
          <span className="whitespace-nowrap text-xs text-mist">Crossfade</span>
          <input
            type="range"
            className="fader w-28"
            style={{ "--fill": `${(crossfade / 2) * 100}%` }}
            min={0}
            max={2}
            step={0.1}
            value={crossfade}
            onChange={(e) => setCrossfade(Number(e.target.value))}
          />
          <span className="w-8 font-mono text-xs text-brass-bright">
            {crossfade.toFixed(1)}s
          </span>
        </div>
        <button
          type="button"
          disabled={mixClips.length === 0 || rendering}
          onClick={() => onRender(title, crossfade)}
          className="rounded-full bg-brass px-5 py-2 text-sm font-semibold text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rendering ? "Rendering…" : "Render music bit"}
        </button>
      </div>
      {mixClips.length > 0 && (
        <p className="mt-2 font-mono text-xs text-mist">
          ~{totalDuration.toFixed(1)}s total
        </p>
      )}
    </div>
  );
}

function IconButton({ children, onClick, disabled, label, tone }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={`flex h-6 w-6 items-center justify-center rounded border border-line text-xs text-mist transition disabled:opacity-30 ${
        tone === "ember" ? "hover:border-ember hover:text-ember" : "hover:border-brass hover:text-brass-bright"
      }`}
    >
      {children}
    </button>
  );
}

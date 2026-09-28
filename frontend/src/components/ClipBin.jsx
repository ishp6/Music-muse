import { api } from "../lib/api";
import PlayerRow from "./PlayerRow";

export default function ClipBin({ clips, mixIds, onAdd, onDelete }) {
  if (clips.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 text-sm text-mist">
        Render a clip and it'll land here, ready to add to a mix.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {clips.map((clip) => {
        const inMix = mixIds.includes(clip.id);
        return (
          <div
            key={clip.id}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <div className="mb-2 flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-paper">{clip.name}</p>
                <p className="text-xs text-mist">
                  from {clip.trackName} · {effectSummary(clip.effects)}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={() => onAdd(clip.id)}
                  disabled={inMix}
                  className="rounded-full border border-brass px-3 py-1 text-xs font-medium text-brass-bright transition hover:bg-brass hover:text-ink disabled:opacity-40"
                >
                  {inMix ? "In mix" : "Add to mix"}
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(clip.id)}
                  aria-label="Delete clip"
                  className="rounded-full border border-line px-2 py-1 text-xs text-mist transition hover:border-ember hover:text-ember"
                >
                  ✕
                </button>
              </div>
            </div>
            <PlayerRow src={api.mediaUrl(clip.url)} duration={clip.duration} />
          </div>
        );
      })}
    </div>
  );
}

function effectSummary(effects = {}) {
  const bits = [];
  if (effects.speed && effects.speed !== 1) bits.push(`${effects.speed}× speed`);
  if (effects.pitch) bits.push(`${effects.pitch > 0 ? "+" : ""}${effects.pitch}st`);
  if (effects.volume && effects.volume !== 1)
    bits.push(`${Math.round(effects.volume * 100)}% vol`);
  if (effects.reverse) bits.push("reversed");
  return bits.length ? bits.join(" · ") : "no effects";
}

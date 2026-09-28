import { api, formatDuration } from "../lib/api";
import PlayerRow from "./PlayerRow";

export default function Library({ creations, onDelete }) {
  if (creations.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-5 text-sm text-mist">
        Your rendered music bits will show up here once you mix some clips.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {creations.map((creation) => (
        <div
          key={creation.id}
          className="rounded-lg border border-line bg-surface p-4"
        >
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-paper">
                {creation.title}
              </p>
              <p className="text-xs text-mist">
                {creation.clipNames.join(" → ")} ·{" "}
                {formatDuration(creation.duration)}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <a
                href={api.mediaUrl(creation.url)}
                download={`${creation.title}.mp3`}
                aria-label="Download"
                className="rounded-full border border-line px-2 py-1 text-xs text-mist transition hover:border-brass hover:text-brass-bright"
              >
                ⭳
              </a>
              <button
                type="button"
                onClick={() => onDelete(creation.id)}
                aria-label="Delete"
                className="rounded-full border border-line px-2 py-1 text-xs text-mist transition hover:border-ember hover:text-ember"
              >
                ✕
              </button>
            </div>
          </div>
          <PlayerRow
            src={api.mediaUrl(creation.url)}
            duration={creation.duration}
            accent="ember"
          />
        </div>
      ))}
    </div>
  );
}

import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import RegionsPlugin from "wavesurfer.js/plugins/regions";
import { api, formatDuration } from "../lib/api";

export default function SourceDeck({
  tracks,
  selectedTrack,
  onSelectTrack,
  onUpload,
  region,
  onRegionChange,
  uploading,
}) {
  const containerRef = useRef(null);
  const wsRef = useRef(null);
  const regionsRef = useRef(null);
  const fileInputRef = useRef(null);
  const [ready, setReady] = useState(false);

  // (Re)build the waveform whenever the selected track changes.
  useEffect(() => {
    if (!selectedTrack || !containerRef.current) return;
    setReady(false);

    const regions = RegionsPlugin.create();
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "#2e4644",
      progressColor: "#d9a441",
      cursorColor: "#ede7dd",
      height: 96,
      barWidth: 2,
      barGap: 2,
      barRadius: 2,
      url: api.mediaUrl(selectedTrack.url),
      plugins: [regions],
    });

    wsRef.current = ws;
    regionsRef.current = regions;

    ws.on("ready", () => {
      setReady(true);
      const dur = ws.getDuration();
      const start = 0;
      const end = Math.min(dur, dur > 8 ? dur * 0.25 + 4 : dur);
      regions.addRegion({
        id: "selection",
        start,
        end,
        color: "rgba(217, 164, 65, 0.25)",
        drag: true,
        resize: true,
      });
      onRegionChange({ start, end });
    });

    regions.on("region-updated", (region) => {
      if (region.id !== "selection") return;
      onRegionChange({ start: region.start, end: region.end });
    });

    regions.on("region-clicked", (region, e) => {
      e.stopPropagation();
      region.play();
    });

    return () => {
      ws.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTrack?.id]);

  const handleFile = useCallback(
    (file) => {
      if (!file) return;
      onUpload(file);
    },
    [onUpload]
  );

  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="rounded-full border border-brass px-4 py-2 text-sm font-medium text-brass-bright transition hover:bg-brass hover:text-ink disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload a song"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
        <span className="text-xs text-mist">
          MP3, WAV, M4A, OGG or FLAC — up to 40MB
        </span>

        {tracks.length > 0 && (
          <select
            value={selectedTrack?.id || ""}
            onChange={(e) =>
              onSelectTrack(tracks.find((t) => t.id === e.target.value))
            }
            className="ml-auto rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-paper focus:border-brass focus:outline-none"
          >
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name} · {formatDuration(t.duration)}
              </option>
            ))}
          </select>
        )}
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        className="mt-4 min-h-[6rem] rounded-md border border-dashed border-line/70 bg-ink-deep/50 p-3"
      >
        {selectedTrack ? (
          <>
            <div ref={containerRef} />
            {!ready && (
              <p className="mt-1 text-xs text-mist">Loading waveform…</p>
            )}
          </>
        ) : (
          <p className="flex h-24 items-center justify-center text-sm text-mist">
            Drop a song here, or upload one above, to start carving a clip.
          </p>
        )}
      </div>

      {selectedTrack && region && (
        <p className="mt-3 font-mono text-xs text-mist">
          Selection: {formatDuration(region.start)} – {formatDuration(region.end)} ·
          drag the handles on the waveform to adjust
        </p>
      )}
    </div>
  );
}

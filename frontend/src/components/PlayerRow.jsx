import { useEffect, useRef, useState } from "react";
import { formatDuration } from "../lib/api";

export default function PlayerRow({ src, duration = 0, accent = "brass" }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onTime = () => {
      if (audio.duration) setProgress(audio.currentTime / audio.duration);
    };
    const onEnd = () => {
      setPlaying(false);
      setProgress(0);
    };
    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      // Pause any other player currently running so bits don't overlap.
      document.querySelectorAll("audio[data-muse]").forEach((el) => {
        if (el !== audio) el.pause();
      });
      audio.play();
      setPlaying(true);
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
    setProgress(ratio);
  };

  const accentClass = accent === "ember" ? "bg-ember" : "bg-brass";

  return (
    <div className="flex items-center gap-3">
      <audio ref={audioRef} src={src} data-muse preload="none" />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? "Pause" : "Play"}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-paper transition hover:border-brass"
      >
        {playing ? <PauseIcon /> : <PlayIcon />}
      </button>
      <div
        onClick={seek}
        className="relative h-1.5 flex-1 cursor-pointer rounded-full bg-line"
      >
        <div
          className={`absolute inset-y-0 left-0 rounded-full ${accentClass}`}
          style={{ width: `${Math.min(100, progress * 100)}%` }}
        />
      </div>
      <span className="w-10 shrink-0 font-mono text-xs text-mist">
        {formatDuration(duration)}
      </span>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <path d="M2 1.5v9l8-4.5-8-4.5z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
      <rect x="2" y="1.5" width="3" height="9" />
      <rect x="7" y="1.5" width="3" height="9" />
    </svg>
  );
}

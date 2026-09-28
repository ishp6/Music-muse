import { useState } from "react";

const DEFAULT_EFFECTS = {
  speed: 1,
  pitch: 0,
  volume: 1,
  fadeIn: 0,
  fadeOut: 0.3,
  reverse: false,
};

export default function ShapeModule({ disabled, region, onRender, rendering }) {
  const [effects, setEffects] = useState(DEFAULT_EFFECTS);
  const [name, setName] = useState("");

  const set = (key) => (e) =>
    setEffects((prev) => ({
      ...prev,
      [key]: e.target.type === "checkbox" ? e.target.checked : Number(e.target.value),
    }));

  const clipLength = region ? Math.max(0, region.end - region.start) : 0;

  return (
    <div className="rounded-lg border border-line bg-surface p-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <Fader
          label="Speed"
          value={effects.speed}
          display={`${effects.speed.toFixed(2)}×`}
          min={0.5}
          max={2}
          step={0.01}
          onChange={set("speed")}
          disabled={disabled}
        />
        <Fader
          label="Pitch"
          value={effects.pitch}
          display={`${effects.pitch > 0 ? "+" : ""}${effects.pitch} st`}
          min={-12}
          max={12}
          step={1}
          onChange={set("pitch")}
          disabled={disabled}
        />
        <Fader
          label="Volume"
          value={effects.volume}
          display={`${Math.round(effects.volume * 100)}%`}
          min={0}
          max={2}
          step={0.01}
          onChange={set("volume")}
          disabled={disabled}
        />
        <Fader
          label="Fade in"
          value={effects.fadeIn}
          display={`${effects.fadeIn.toFixed(1)}s`}
          min={0}
          max={Math.max(0.5, Math.min(4, clipLength / 2))}
          step={0.1}
          onChange={set("fadeIn")}
          disabled={disabled}
        />
        <Fader
          label="Fade out"
          value={effects.fadeOut}
          display={`${effects.fadeOut.toFixed(1)}s`}
          min={0}
          max={Math.max(0.5, Math.min(4, clipLength / 2))}
          step={0.1}
          onChange={set("fadeOut")}
          disabled={disabled}
        />
        <label className="flex items-center gap-2 self-end pb-1 text-sm text-paper">
          <input
            type="checkbox"
            checked={effects.reverse}
            onChange={set("reverse")}
            disabled={disabled}
            className="h-4 w-4 accent-brass"
          />
          Reverse
        </label>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name this clip"
          disabled={disabled}
          className="min-w-0 flex-1 rounded-md border border-line bg-surface-2 px-3 py-2 text-sm text-paper placeholder:text-mist focus:border-brass focus:outline-none"
        />
        <button
          type="button"
          disabled={disabled || rendering}
          onClick={() => onRender(effects, name)}
          className="rounded-full bg-brass px-5 py-2 text-sm font-semibold text-ink transition hover:bg-brass-bright disabled:cursor-not-allowed disabled:opacity-50"
        >
          {rendering ? "Rendering…" : "Render clip"}
        </button>
      </div>
    </div>
  );
}

function Fader({ label, value, display, min, max, step, onChange, disabled }) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-mist">{label}</span>
        <span className="font-mono text-brass-bright">{display}</span>
      </div>
      <input
        type="range"
        className="fader"
        style={{ "--fill": `${fill}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={onChange}
        disabled={disabled}
      />
    </div>
  );
}

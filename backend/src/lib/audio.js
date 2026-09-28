import ffmpeg from "fluent-ffmpeg";
import path from "path";

/** Resolve the duration (seconds) of an audio file via ffprobe. */
export function probeDuration(filePath) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, data) => {
      if (err) return reject(err);
      resolve(data.format?.duration ? Number(data.format.duration) : 0);
    });
  });
}

/**
 * Carve a clip out of a source file and apply the requested effects.
 * effects: { speed(0.5-2), pitch(-12..12 semitones), volume(0-2), fadeIn, fadeOut, reverse }
 */
export function renderClip({ sourcePath, start, end, effects = {}, outPath }) {
  return new Promise((resolve, reject) => {
    const {
      speed = 1,
      pitch = 0,
      volume = 1,
      fadeIn = 0,
      fadeOut = 0,
      reverse = false,
    } = effects;

    const duration = Math.max(0.05, end - start);
    const filters = [];

    // Pitch shift in semitones, independent of tempo, via rubberband.
    if (pitch && pitch !== 0) {
      const pitchScale = Math.pow(2, pitch / 12);
      filters.push(`rubberband=pitch=${pitchScale.toFixed(6)}`);
    }

    // Tempo change. atempo only accepts 0.5-2.0 per stage, which covers our UI range.
    if (speed && speed !== 1) {
      const clamped = Math.min(2, Math.max(0.5, speed));
      filters.push(`atempo=${clamped.toFixed(3)}`);
    }

    if (reverse) filters.push("areverse");

    if (volume && volume !== 1) {
      filters.push(`volume=${volume.toFixed(3)}`);
    }

    // Fades are applied against the *output* duration (post speed-change).
    const outDuration = duration / (speed || 1);
    if (fadeIn > 0) filters.push(`afade=t=in:st=0:d=${fadeIn.toFixed(3)}`);
    if (fadeOut > 0) {
      const st = Math.max(0, outDuration - fadeOut);
      filters.push(`afade=t=out:st=${st.toFixed(3)}:d=${fadeOut.toFixed(3)}`);
    }

    let cmd = ffmpeg(sourcePath)
      .setStartTime(start)
      .duration(duration)
      .audioChannels(2)
      .audioFrequency(44100)
      .audioCodec("libmp3lame")
      .format("mp3");

    if (filters.length) cmd = cmd.audioFilters(filters);

    cmd
      .on("error", reject)
      .on("end", () => resolve(outPath))
      .save(outPath);
  });
}

/**
 * Stitch an ordered list of rendered clip files into one final "creation".
 * Uses acrossfade between consecutive clips when crossfade > 0, otherwise a
 * plain concat.
 */
export function renderCreation({ clipPaths, crossfade = 0, outPath }) {
  return new Promise((resolve, reject) => {
    if (clipPaths.length === 1) {
      // Nothing to mix — just re-encode/copy the single clip.
      ffmpeg(clipPaths[0])
        .audioCodec("libmp3lame")
        .format("mp3")
        .on("error", reject)
        .on("end", () => resolve(outPath))
        .save(outPath);
      return;
    }

    const cmd = ffmpeg();
    clipPaths.forEach((p) => cmd.input(p));

    let filterChain;
    if (crossfade > 0) {
      // Chain acrossfade across all inputs: [0][1]acrossfade=...[a1]; [a1][2]acrossfade...
      let last = "[0:a]";
      const parts = [];
      for (let i = 1; i < clipPaths.length; i++) {
        const out = i === clipPaths.length - 1 ? "[mix]" : `[a${i}]`;
        parts.push(
          `${last}[${i}:a]acrossfade=d=${crossfade}:c1=tri:c2=tri${out}`
        );
        last = out;
      }
      filterChain = parts.join(";");
      cmd.complexFilter(filterChain, "mix");
    } else {
      // Plain concat demuxer-style via concat filter (re-encodes, handles mismatched formats).
      const inputs = clipPaths.map((_, i) => `[${i}:a]`).join("");
      filterChain = `${inputs}concat=n=${clipPaths.length}:v=0:a=1[mix]`;
      cmd.complexFilter(filterChain, "mix");
    }

    cmd
      .audioCodec("libmp3lame")
      .format("mp3")
      .on("error", reject)
      .on("end", () => resolve(outPath))
      .save(outPath);
  });
}

export function ext(filename) {
  return path.extname(filename || "").toLowerCase();
}

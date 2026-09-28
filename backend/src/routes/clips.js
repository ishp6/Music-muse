import { Router } from "express";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { renderClip, probeDuration } from "../lib/audio.js";
import { db } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
const PROCESSED_DIR = path.join(__dirname, "..", "..", "processed");
fs.mkdirSync(PROCESSED_DIR, { recursive: true });

const router = Router();

router.post("/", async (req, res) => {
  const { trackId, start, end, name, effects } = req.body || {};
  const { tracks } = db.get();
  const track = tracks.find((t) => t.id === trackId);
  if (!track) return res.status(404).json({ error: "Source track not found" });

  const s = Number(start);
  const e = Number(end);
  if (!(e > s) || s < 0) {
    return res.status(400).json({ error: "Invalid start/end range" });
  }

  const id = nanoid(10);
  const outFile = `${id}.mp3`;
  const outPath = path.join(PROCESSED_DIR, outFile);
  const sourcePath = path.join(UPLOAD_DIR, track.filename);

  try {
    await renderClip({
      sourcePath,
      start: s,
      end: e,
      effects: effects || {},
      outPath,
    });
    const duration = await probeDuration(outPath);
    const clip = {
      id,
      trackId,
      trackName: track.name,
      name: name?.trim() || `${track.name} clip`,
      sourceStart: s,
      sourceEnd: e,
      effects: effects || {},
      duration,
      filename: outFile,
      url: `/media/processed/${outFile}`,
      createdAt: new Date().toISOString(),
    };
    await db.update((data) => data.clips.push(clip));
    res.status(201).json(clip);
  } catch (err) {
    fs.unlink(outPath, () => {});
    res.status(500).json({ error: err.message || "Failed to render clip" });
  }
});

router.get("/", (_req, res) => {
  const { clips } = db.get();
  res.json([...clips].reverse());
});

router.delete("/:id", async (req, res) => {
  const { clips } = db.get();
  const clip = clips.find((c) => c.id === req.params.id);
  if (!clip) return res.status(404).json({ error: "Not found" });
  await db.update((data) => {
    data.clips = data.clips.filter((c) => c.id !== req.params.id);
  });
  fs.unlink(path.join(PROCESSED_DIR, clip.filename), () => {});
  res.status(204).end();
});

export default router;

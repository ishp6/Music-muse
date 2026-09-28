import { Router } from "express";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { renderCreation, probeDuration } from "../lib/audio.js";
import { db } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROCESSED_DIR = path.join(__dirname, "..", "..", "processed");
const CREATIONS_DIR = path.join(__dirname, "..", "..", "creations");
fs.mkdirSync(CREATIONS_DIR, { recursive: true });

const router = Router();

router.post("/", async (req, res) => {
  const { title, clipIds, crossfade } = req.body || {};
  if (!Array.isArray(clipIds) || clipIds.length === 0) {
    return res.status(400).json({ error: "clipIds must be a non-empty array" });
  }

  const { clips } = db.get();
  const byId = new Map(clips.map((c) => [c.id, c]));
  const ordered = clipIds.map((id) => byId.get(id));
  if (ordered.some((c) => !c)) {
    return res.status(400).json({ error: "One or more clips no longer exist" });
  }

  const id = nanoid(10);
  const outFile = `${id}.mp3`;
  const outPath = path.join(CREATIONS_DIR, outFile);
  const clipPaths = ordered.map((c) => path.join(PROCESSED_DIR, c.filename));

  try {
    await renderCreation({
      clipPaths,
      crossfade: Number(crossfade) || 0,
      outPath,
    });
    const duration = await probeDuration(outPath);
    const creation = {
      id,
      title: title?.trim() || "Untitled Music Bit",
      clipIds,
      clipNames: ordered.map((c) => c.name),
      crossfade: Number(crossfade) || 0,
      duration,
      filename: outFile,
      url: `/media/creations/${outFile}`,
      createdAt: new Date().toISOString(),
    };
    await db.update((data) => data.creations.push(creation));
    res.status(201).json(creation);
  } catch (err) {
    fs.unlink(outPath, () => {});
    res.status(500).json({ error: err.message || "Failed to render creation" });
  }
});

router.get("/", (_req, res) => {
  const { creations } = db.get();
  res.json([...creations].reverse());
});

router.delete("/:id", async (req, res) => {
  const { creations } = db.get();
  const creation = creations.find((c) => c.id === req.params.id);
  if (!creation) return res.status(404).json({ error: "Not found" });
  await db.update((data) => {
    data.creations = data.creations.filter((c) => c.id !== req.params.id);
  });
  fs.unlink(path.join(CREATIONS_DIR, creation.filename), () => {});
  res.status(204).end();
});

export default router;

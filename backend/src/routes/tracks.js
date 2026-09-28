import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { nanoid } from "nanoid";
import { fileURLToPath } from "url";
import { probeDuration } from "../lib/audio.js";
import { db } from "../lib/db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED = new Set([".mp3", ".wav", ".m4a", ".ogg", ".flac", ".webm"]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const id = nanoid(10);
    cb(null, `${id}${path.extname(file.originalname).toLowerCase()}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB per song
  fileFilter: (_req, file, cb) => {
    const e = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED.has(e)) return cb(new Error("Unsupported audio format"));
    cb(null, true);
  },
});

const router = Router();

router.post("/upload", upload.single("audio"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  try {
    const duration = await probeDuration(req.file.path);
    const track = {
      id: path.parse(req.file.filename).name,
      name: req.body.name?.trim() || path.parse(req.file.originalname).name,
      filename: req.file.filename,
      duration,
      url: `/media/uploads/${req.file.filename}`,
      createdAt: new Date().toISOString(),
    };
    await db.update((data) => data.tracks.push(track));
    res.status(201).json(track);
  } catch (err) {
    fs.unlink(req.file.path, () => {});
    res.status(500).json({ error: err.message });
  }
});

router.get("/", (_req, res) => {
  const { tracks } = db.get();
  res.json([...tracks].reverse());
});

router.delete("/:id", async (req, res) => {
  const { tracks } = db.get();
  const track = tracks.find((t) => t.id === req.params.id);
  if (!track) return res.status(404).json({ error: "Not found" });
  await db.update((data) => {
    data.tracks = data.tracks.filter((t) => t.id !== req.params.id);
  });
  fs.unlink(path.join(UPLOAD_DIR, track.filename), () => {});
  res.status(204).end();
});

export default router;

import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import tracksRouter from "./src/routes/tracks.js";
import clipsRouter from "./src/routes/clips.js";
import creationsRouter from "./src/routes/creations.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 5050;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/media/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/media/processed", express.static(path.join(__dirname, "processed")));
app.use("/media/creations", express.static(path.join(__dirname, "creations")));

app.use("/api/tracks", tracksRouter);
app.use("/api/clips", clipsRouter);
app.use("/api/creations", creationsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// Basic error guard so an ffmpeg/multer failure returns JSON, not a crash.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: err.message || "Server error" });
});

fs.mkdirSync(path.join(__dirname, "data"), { recursive: true });

app.listen(PORT, () => {
  console.log(`🎵 Music Muse backend listening on http://localhost:${PORT}`);
});

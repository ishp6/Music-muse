# Music Muse

Carve new music bits out of your favourite songs: upload a track, select a
region on its waveform, shape it with real audio effects (speed, pitch,
volume, fades, reverse), collect the results in a bin, sequence several
clips into a mix, and render the whole thing into a new track you can play
back or download.

Everything runs on your own machine — audio never leaves your server.

## Stack

- **Backend** — Node.js + Express, with [`ffmpeg`](https://ffmpeg.org)
  (built with `librubberband`) doing the real audio work: trimming,
  tempo/pitch shifting, fades, reverse, and crossfaded stitching. A flat
  JSON file tracks metadata for uploaded songs, rendered clips, and
  finished "music bits" — no database to set up.
- **Frontend** — React + Vite + Tailwind CSS v4, with
  [`wavesurfer.js`](https://wavesurfer.xyz) for the waveform display and
  draggable region selection.

## Prerequisites

- Node.js 18+
- `ffmpeg` on your `PATH`, built with the `rubberband` filter (most
  distro packages and the official builds include it). Check with:

  ```bash
  ffmpeg -filters | grep rubberband
  ```

## Running it locally

**1. Start the backend**

```bash
cd backend
npm install
npm start
# → 🎵 Music Muse backend listening on http://localhost:5050
```

**2. Start the frontend** (in a second terminal)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

Open http://localhost:5173. If your backend runs somewhere other than
`http://localhost:5050`, copy `frontend/.env.example` to `frontend/.env`
and set `VITE_API_URL`.

## How it works

1. **Capture & shape** — upload an audio file (MP3/WAV/M4A/OGG/FLAC, up
   to 40MB), pick the region you want with the waveform's drag handles,
   then set speed, pitch (in semitones, independent of speed), volume,
   fade in/out and reverse, and render it into a clip.
2. **Clip bin** — every rendered clip lands here. Preview it, add it to
   the mix, or delete it.
3. **Mix rack** — queue up clips in order, reorder them, set a crossfade
   length, name your track, and render it.
4. **Library** — your finished music bits, ready to play or download as
   MP3.

## API

| Method | Route                | What it does                                   |
| ------ | --------------------- | ----------------------------------------------- |
| POST   | `/api/tracks/upload`  | Upload a source song (`multipart/form-data`, field `audio`) |
| GET    | `/api/tracks`         | List uploaded songs                             |
| POST   | `/api/clips`          | Render a clip: `{ trackId, start, end, name, effects }` |
| GET    | `/api/clips`          | List rendered clips                             |
| POST   | `/api/creations`      | Mix clips into a bit: `{ title, clipIds, crossfade }` |
| GET    | `/api/creations`      | List finished music bits                        |

`effects` accepts `{ speed (0.5–2), pitch (semitones, -12..12), volume
(0–2), fadeIn, fadeOut (seconds), reverse (bool) }`.

## Project layout

```
music-muse/
├── backend/
│   ├── server.js
│   └── src/
│       ├── routes/       # tracks, clips, creations
│       └── lib/          # ffmpeg helpers + JSON datastore
└── frontend/
    └── src/
        ├── components/   # SourceDeck, ShapeModule, ClipBin, MixRack, Library...
        └── lib/api.js    # backend client
```

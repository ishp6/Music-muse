import { useEffect, useState, useCallback } from "react";
import { api } from "./lib/api";
import TopBar from "./components/TopBar";
import StageHeading from "./components/StageHeading";
import SourceDeck from "./components/SourceDeck";
import ShapeModule from "./components/ShapeModule";
import ClipBin from "./components/ClipBin";
import MixRack from "./components/MixRack";
import Library from "./components/Library";

export default function App() {
  const [tracks, setTracks] = useState([]);
  const [clips, setClips] = useState([]);
  const [creations, setCreations] = useState([]);

  const [selectedTrack, setSelectedTrack] = useState(null);
  const [region, setRegion] = useState(null);
  const [mixIds, setMixIds] = useState([]);

  const [uploading, setUploading] = useState(false);
  const [renderingClip, setRenderingClip] = useState(false);
  const [renderingMix, setRenderingMix] = useState(false);
  const [error, setError] = useState("");
  const [booting, setBooting] = useState(true);

  const refreshAll = useCallback(async () => {
    const [t, c, m] = await Promise.all([
      api.listTracks(),
      api.listClips(),
      api.listCreations(),
    ]);
    setTracks(t);
    setClips(c);
    setCreations(m);
    return t;
  }, []);

  useEffect(() => {
    refreshAll()
      .then((t) => {
        if (t.length) setSelectedTrack(t[0]);
      })
      .catch((e) => setError(e.message))
      .finally(() => setBooting(false));
  }, [refreshAll]);

  const runSafely = async (fn) => {
    try {
      setError("");
      await fn();
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
  };

  const handleUpload = (file) =>
    runSafely(async () => {
      setUploading(true);
      try {
        const track = await api.uploadTrack(file);
        setTracks((prev) => [track, ...prev]);
        setSelectedTrack(track);
      } finally {
        setUploading(false);
      }
    });

  const handleRenderClip = (effects, name) =>
    runSafely(async () => {
      if (!selectedTrack || !region) return;
      setRenderingClip(true);
      try {
        const clip = await api.createClip({
          trackId: selectedTrack.id,
          start: region.start,
          end: region.end,
          name,
          effects,
        });
        setClips((prev) => [clip, ...prev]);
      } finally {
        setRenderingClip(false);
      }
    });

  const handleAddToMix = (clipId) =>
    setMixIds((prev) => (prev.includes(clipId) ? prev : [...prev, clipId]));

  const handleRemoveFromMix = (clipId) =>
    setMixIds((prev) => prev.filter((id) => id !== clipId));

  const handleRenderMix = (title, crossfade) =>
    runSafely(async () => {
      setRenderingMix(true);
      try {
        const creation = await api.createCreation({
          title,
          clipIds: mixIds,
          crossfade,
        });
        setCreations((prev) => [creation, ...prev]);
        setMixIds([]);
      } finally {
        setRenderingMix(false);
      }
    });

  const handleDeleteClip = (id) =>
    runSafely(async () => {
      await api.deleteClip(id);
      setClips((prev) => prev.filter((c) => c.id !== id));
      setMixIds((prev) => prev.filter((cid) => cid !== id));
    });

  const handleDeleteCreation = (id) =>
    runSafely(async () => {
      await api.deleteCreation(id);
      setCreations((prev) => prev.filter((c) => c.id !== id));
    });

  return (
    <div className="min-h-screen bg-ink">
      <TopBar
        trackCount={tracks.length}
        clipCount={clips.length}
        bitCount={creations.length}
      />

      <main className="mx-auto max-w-6xl space-y-12 px-6 py-10">
        {error && (
          <div className="rounded-md border border-ember/60 bg-ember/10 px-4 py-3 text-sm text-ember">
            {error}
          </div>
        )}

        {booting ? (
          <p className="text-sm text-mist">Warming up the deck…</p>
        ) : (
          <>
            <section>
              <StageHeading
                index="01"
                title="Capture & shape"
                note="Pick a song, select a region, sculpt it"
              />
              <div className="space-y-4">
                <SourceDeck
                  tracks={tracks}
                  selectedTrack={selectedTrack}
                  onSelectTrack={setSelectedTrack}
                  onUpload={handleUpload}
                  uploading={uploading}
                  region={region}
                  onRegionChange={setRegion}
                />
                <ShapeModule
                  disabled={!selectedTrack || !region}
                  region={region}
                  onRender={handleRenderClip}
                  rendering={renderingClip}
                />
              </div>
            </section>

            <section>
              <StageHeading
                index="02"
                title="Clip bin"
                note={`${clips.length} rendered`}
              />
              <ClipBin
                clips={clips}
                mixIds={mixIds}
                onAdd={handleAddToMix}
                onDelete={handleDeleteClip}
              />
            </section>

            <section>
              <StageHeading
                index="03"
                title="Mix rack"
                note={`${mixIds.length} queued`}
              />
              <MixRack
                clips={clips}
                mixIds={mixIds}
                onReorder={setMixIds}
                onRemove={handleRemoveFromMix}
                onRender={handleRenderMix}
                rendering={renderingMix}
              />
            </section>

            <section>
              <StageHeading
                index="04"
                title="Library"
                note={`${creations.length} music bits`}
              />
              <Library creations={creations} onDelete={handleDeleteCreation} />
            </section>
          </>
        )}
      </main>

      <footer className="border-t border-line px-6 py-6 text-center text-xs text-mist">
        Built with ffmpeg + rubberband — every bit is rendered from your own
        uploads, on your own server.
      </footer>
    </div>
  );
}

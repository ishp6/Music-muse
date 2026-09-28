const BASE = import.meta.env.VITE_API_URL || "http://localhost:5050";

async function handle(res) {
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  base: BASE,

  async listTracks() {
    return handle(await fetch(`${BASE}/api/tracks`));
  },

  async uploadTrack(file, name) {
    const form = new FormData();
    form.append("audio", file);
    if (name) form.append("name", name);
    return handle(
      await fetch(`${BASE}/api/tracks/upload`, { method: "POST", body: form })
    );
  },

  async deleteTrack(id) {
    return handle(await fetch(`${BASE}/api/tracks/${id}`, { method: "DELETE" }));
  },

  async listClips() {
    return handle(await fetch(`${BASE}/api/clips`));
  },

  async createClip(payload) {
    return handle(
      await fetch(`${BASE}/api/clips`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
  },

  async deleteClip(id) {
    return handle(await fetch(`${BASE}/api/clips/${id}`, { method: "DELETE" }));
  },

  async listCreations() {
    return handle(await fetch(`${BASE}/api/creations`));
  },

  async createCreation(payload) {
    return handle(
      await fetch(`${BASE}/api/creations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
  },

  async deleteCreation(id) {
    return handle(
      await fetch(`${BASE}/api/creations/${id}`, { method: "DELETE" })
    );
  },

  mediaUrl(relativeUrl) {
    return `${BASE}${relativeUrl}`;
  },
};

export function formatDuration(seconds = 0) {
  const s = Math.max(0, Math.round(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
}

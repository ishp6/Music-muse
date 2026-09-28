import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, "..", "..", "data", "db.json");

function readRaw() {
  if (!fs.existsSync(DB_PATH)) {
    return { tracks: [], clips: [], creations: [] };
  }
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
  } catch {
    return { tracks: [], clips: [], creations: [] };
  }
}

// Serialize writes so concurrent requests never clobber each other.
let queue = Promise.resolve();
function writeRaw(data) {
  queue = queue.then(
    () =>
      new Promise((resolve, reject) => {
        fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), (err) =>
          err ? reject(err) : resolve()
        );
      })
  );
  return queue;
}

export const db = {
  get() {
    return readRaw();
  },
  async update(mutator) {
    const data = readRaw();
    const result = mutator(data);
    await writeRaw(data);
    return result;
  },
};

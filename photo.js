// Фото машины: сжатие на устройстве и хранение в IndexedDB.

const DB_NAME = 'bortjournal';
const STORE = 'photos';

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('no indexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const req = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(req?.result);
    t.onerror = () => reject(t.error);
  });
}

// В памяти тоже держим копию — если IndexedDB недоступна, фото живёт до перезапуска
const mem = new Map();

export const photoDB = {
  async get(carId) {
    if (mem.has(carId)) return mem.get(carId);
    try {
      const v = await tx('readonly', (s) => s.get(carId));
      if (v) mem.set(carId, v);
      return v || null;
    } catch {
      return null;
    }
  },
  async set(carId, b64) {
    mem.set(carId, b64);
    try { await tx('readwrite', (s) => s.put(b64, carId)); } catch { /* только память */ }
  },
  async remove(carId) {
    mem.delete(carId);
    try { await tx('readwrite', (s) => s.delete(carId)); } catch { /* ignore */ }
  },
  async clear() {
    mem.clear();
    try { await tx('readwrite', (s) => s.clear()); } catch { /* ignore */ }
  },
  async all(ids) {
    const out = {};
    for (const id of ids) {
      const v = await this.get(id);
      if (v) out[id] = v;
    }
    return out;
  },
};

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => resolve({ img, url });
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('bad image'));
    };
    img.src = url;
  });
}

// Уменьшает до 800 px по длинной стороне и подбирает качество JPEG до ~75 КБ.
// Возвращает base64 без префикса data:.
export async function compressPhoto(file, { maxSide = 800, maxBytes = 78 * 1024 } = {}) {
  const { img, url } = await loadImage(file);
  try {
    let scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    for (let attempt = 0; attempt < 6; attempt++) {
      canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      for (const q of [0.82, 0.74, 0.66, 0.58, 0.5]) {
        const b64 = canvas.toDataURL('image/jpeg', q).split(',')[1];
        if (b64.length * 0.75 <= maxBytes) return b64;
      }
      scale *= 0.8;
    }
    return canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
  } finally {
    URL.revokeObjectURL(url);
  }
}

export const photoURL = (b64) => (b64 ? 'data:image/jpeg;base64,' + b64 : '');

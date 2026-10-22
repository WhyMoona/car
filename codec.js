// Сжатие, хеш и разбивка строк на части для Telegram CloudStorage.

export function hash(str) {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return (h >>> 0).toString(36) + str.length.toString(36);
}

export function bytesToB64(bytes) {
  let s = '';
  const step = 0x8000;
  for (let i = 0; i < bytes.length; i += step) s += String.fromCharCode.apply(null, bytes.subarray(i, i + step));
  return btoa(s);
}

export function b64ToBytes(b64) {
  const s = atob(b64);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function pipe(bytes, stream) {
  const buf = await new Response(new Blob([bytes]).stream().pipeThrough(stream)).arrayBuffer();
  return new Uint8Array(buf);
}

// 'D' + base64(deflate) — если браузер умеет сжимать, иначе 'J' + исходный JSON
export async function compress(str) {
  if (typeof CompressionStream === 'undefined') return 'J' + str;
  const out = await pipe(new TextEncoder().encode(str), new CompressionStream('deflate-raw'));
  return 'D' + bytesToB64(out);
}

export async function decompress(s) {
  if (s[0] === 'J') return s.slice(1);
  if (s[0] === 'D') {
    const out = await pipe(b64ToBytes(s.slice(1)), new DecompressionStream('deflate-raw'));
    return new TextDecoder().decode(out);
  }
  throw new Error('unknown encoding');
}

export function chunk(str, size) {
  if (!str.length) return [''];
  const parts = [];
  for (let i = 0; i < str.length; i += size) parts.push(str.slice(i, i + size));
  return parts;
}

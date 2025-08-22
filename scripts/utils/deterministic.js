/** Deterministic helpers for verifiers (no external deps). */

/**
 * Convert hex string to Uint8Array.
 * @param {string} input
 * @returns {Uint8Array}
 */
export function fromHexString(input) {
  if (typeof input !== "string") throw new Error("Invalid hex string");
  input = input.replace(/\s+/g, "").toLowerCase();
  if (!/^[\da-f]*$/.test(input)) throw new Error("Invalid hex string");
  if (input.length % 2 !== 0) input = "0" + input;
  const result = new Uint8Array(input.length / 2);
  for (let i = 0; i < result.length; i++) {
    result[i] = parseInt(input.substring(i * 2, i * 2 + 2), 16);
  }
  return result;
}

/**
 * Concatenate multiple Uint8Arrays.
 * @param {Uint8Array[]} parts
 * @returns {Uint8Array}
 */
export function concat(parts) {
  const length = parts.reduce((acc, p) => acc + p.length, 0);
  const out = new Uint8Array(length);
  let offset = 0;
  for (const p of parts) {
    out.set(p, offset);
    offset += p.length;
  }
  return out;
}

/**
 * SHA-384 digest of bytes.
 * @param {Uint8Array} bytes
 * @returns {Promise<Uint8Array>}
 */
export async function sha384(bytes) {
  const digest = await crypto.subtle.digest("SHA-384", bytes);
  return new Uint8Array(digest);
}

/**
 * SHA-384 digest of concatenated input byte arrays.
 * @param {Uint8Array[]} inputs
 */
export async function sha384Concat(inputs) {
  return sha384(concat(inputs));
}

/**
 * SHA-384 of concatenation of per-input SHA-384 digests.
 * @param {Uint8Array[]} inputs
 */
export async function sha384ConcatOfHashes(inputs) {
  const hashed = await Promise.all(inputs.map((b) => sha384(b)));
  return sha384(concat(hashed));
}

/** Increment an AES-CTR counter. */
export function incrementCounter(counter) {
  for (let i = counter.length - 1; i >= 0; i--) {
    if (counter[i] === 255) counter[i] = 0;
    else {
      counter[i]++;
      break;
    }
  }
}

/**
 * Generate N blocks (16 bytes each) using AES-CTR with the first 32 bytes as key and next 16 as counter.
 * @param {Uint8Array} seed48 48 bytes (32 key + 16 counter)
 * @param {number} blockCount
 * @returns {Promise<Uint8Array>}
 */
export async function aesCtrBlocks(seed48, blockCount) {
  const keyBytes = new Uint8Array(seed48.slice(0, 32));
  const counter = new Uint8Array(seed48.slice(32, 48));
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CTR" },
    false,
    ["encrypt"],
  );
  const out = new Uint8Array(blockCount * 16);
  for (let i = 0; i < blockCount; i++) {
    const block = await crypto.subtle.encrypt(
      { name: "AES-CTR", length: 128, counter },
      cryptoKey,
      new Uint8Array(16),
    );
    out.set(new Uint8Array(block), i * 16);
    incrementCounter(counter);
  }
  return out;
}

/**
 * Deterministic random bytes from inputs using SHA-384 + AES-CTR.
 * @param {Uint8Array[]} inputs
 * @param {number} blockCount
 * @param {"concat"|"concat-of-hashes"} mode
 */
export async function randomBytesFromInputs(inputs, blockCount, mode = "concat") {
  const seed = mode === "concat-of-hashes" ? await sha384ConcatOfHashes(inputs) : await sha384Concat(inputs);
  return aesCtrBlocks(seed, blockCount);
}

/**
 * Random number in [0,1] using XOR fold of 32-bit words from AES-CTR blocks.
 * @param {Uint8Array[]} inputs
 * @param {number} blockCount
 * @param {"concat"|"concat-of-hashes"} mode
 */
export async function randomNumberFromInputs(inputs, blockCount = 1, mode = "concat") {
  const random = await randomBytesFromInputs(inputs, blockCount, mode);
  const view = new DataView(random.buffer);
  let acc = 0;
  for (let i = 0; i < view.byteLength; i += 4) {
    acc ^= view.getUint32(i, true);
  }
  return 0.5 + acc / 0xffffffff;
}

/** Convert number string to 8-byte little-endian Uint8Array. */
export function uint64FromString(n) {
  const v = new BigUint64Array([BigInt(n)]);
  return new Uint8Array(v.buffer);
}



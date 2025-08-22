import { createHash, createHmac } from "../scripts/crypto.js";
import { bufferToHex } from "../scripts/buffers.js";

/**
 * Gets the crash point of the given game hash and salt.
 *
 * @param {string} seed - The game hash.
 * @param {string} salt - The salt.
 */
export async function gameResult(seed, salt) {
  const nBits = 52; // number of most significant bits to use

  // 1. HMAC_SHA256(message=seed, key=salt)
  const hmac = await createHmac(seed, salt, "SHA-256");
  seed = bufferToHex(hmac);

  // 2. r = 52 most significant bits
  seed = seed.slice(0, nBits / 4);
  const r = parseInt(seed, 16);

  // 3. X = r / 2^52
  let X = r / Math.pow(2, nBits); // uniformly distributed in [0; 1]
  X = parseFloat(X.toPrecision(9));

  // 4. X = 99 / (1-X)
  X = 99 / (1 - X);

  // 5. return max(trunc(X), 100)
  const result = Math.floor(X);
  return Math.max(1, result / 100);
}

/**
 * Gets the previous hash of the given game hash.
 *
 * @param {string} current - The current game hash.
 */
export async function getPreviousHash(data) {
  const hash = await createHash(data, "SHA-256");
  return bufferToHex(hash);
}

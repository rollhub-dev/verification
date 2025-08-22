import { hexToBuffer } from "./buffers.js";

if (!window.crypto?.subtle) {
  throw new Error("Crypto API not available");
}

/**
 * Creates a hash of the given data using the given algorithm.
 *
 * @param {string} data - The data to hash.
 * @param {string} algorithm - The algorithm to use for the hash.
 */
export async function createHash(data, algorithm = "SHA-256") {
  return await window.crypto.subtle.digest(
    { name: algorithm },
    new TextEncoder().encode(data),
  );
}

/**
 * Creates a HMAC signature for the given seed and salt.
 *
 * @param {string} seed - The seed to use for the HMAC signature.
 * @param {string} salt - The salt to use for the HMAC signature.
 * @param {string} algorithm - The algorithm to use for the HMAC signature.
 */
export async function createHmac(seed, salt, algorithm = "SHA-256") {
  // Import the salt as the HMAC key
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(salt),
    { name: "HMAC", hash: { name: algorithm } },
    false,
    ["sign"],
  );

  // Convert the hex string seed to a Uint8Array
  const seedBytes = hexToBuffer(seed);

  // Generate the HMAC signature
  return await window.crypto.subtle.sign("HMAC", key, seedBytes);
}

/** Regex for validating a hex string. */
const rxHex = /^[0-9a-fA-F]{1,}$/;
``;
/** Regex for parsing a hex string */
const rxHexParse = /[0-9a-fA-F]{1,2}/g;

/**
 * Converts a hex string to a Uint8Array.
 *
 * @param {string} hex - The hex string.
 * @returns {Uint8Array} The Uint8Array.
 */
export function hexToBuffer(hex) {
  if (typeof hex !== "string") throw new Error("Invalid hex: " + hex);
  if (!rxHex.test(hex)) throw new Error("Invalid hex");

  const match = hex.match(rxHexParse);
  if (!match) throw new Error("Invalid hex");

  const bytes = match.map((byte) => parseInt(byte, 16));
  return new Uint8Array(bytes);
}

/**
 * Converts a Uint8Array to a hex string.
 *
 * @param {Uint8Array | ArrayBuffer} bytes - The bytes to convert.
 * @returns {string} The hex string.
 */
export function bufferToHex(bytes) {
  if (bytes instanceof ArrayBuffer) {
    return bufferToHex(new Uint8Array(bytes));
  }

  if (bytes instanceof Uint8Array) {
    return [...bytes]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  }

  throw new Error("Invalid bytes. Expected Uint8Array or ArrayBuffer");
}

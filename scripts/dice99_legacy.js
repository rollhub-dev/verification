import { fromHexString, randomNumberFromInputs } from "./utils/deterministic.js";

const queries = new URLSearchParams(window.location.search);
const queryServerSeed = queries.get("s");
const queryClientSeed = queries.get("c");
const queryNonce = queries.get("n");
if (queryServerSeed) document.getElementById("inputhash").value = queryServerSeed;
if (queryClientSeed) document.getElementById("clientsecret").value = queryClientSeed;
if (queryNonce) document.getElementById("nonce").value = queryNonce;

document.getElementById("generateBtn").addEventListener("click", async () => {
  const inputHashValue = document.getElementById("inputhash").value;
  const nonceValue = document.getElementById("nonce").value;
  const clientSecretValue = document.getElementById("clientsecret").value;
  if (!inputHashValue || !nonceValue || !clientSecretValue) return;
  const resultEl = document.getElementById("result");
  try {
    const inputHash = fromHexString(inputHashValue);
    const nonce = fromHexString(nonceValue);
    const clientSecret = fromHexString(clientSecretValue);
    const rnd = await randomNumberFromInputs([inputHash, clientSecret, nonce], 1, "concat-of-hashes");
    resultEl.value = (rnd * 100).toFixed(2);
  } catch (error) {
    resultEl.value = "Error: " + (error?.message || String(error));
  }
});



import { fromHexString, randomBytesFromInputs, uint64FromString } from "./utils/deterministic.js";

function renderGrid(grid, gridSize, openedMines = []) {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = "";
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.marginTop = "1em";
  const size = Math.sqrt(gridSize);
  for (let row = 0; row < size; row++) {
    const tr = document.createElement("tr");
    for (let col = 0; col < size; col++) {
      const cellIndex = row * size + col;
      const isMine = grid[cellIndex];
      const isOpened = openedMines.includes(cellIndex);
      const td = document.createElement("td");
      td.style.border = "1px solid #000";
      td.style.width = "30px";
      td.style.height = "30px";
      td.style.textAlign = "center";
      td.style.verticalAlign = "middle";
      if (isOpened) td.style.backgroundColor = isMine ? "#ffcccc" : "#e0ffe0"; else td.style.backgroundColor = "#f0f0f0";
      td.textContent = isMine ? "💥" : "";
      tr.appendChild(td);
    }
    table.appendChild(tr);
  }
  resultDiv.appendChild(table);
}

async function shuffle(server_secret, client_secret, nonce, array) {
  const randomness = await randomBytesFromInputs([
    server_secret,
    client_secret,
    nonce,
  ], Math.ceil(array.length * 4 / 16), "concat");
  let idx = 0;
  const rng = () => {
    const value = (
      (randomness[idx++] << 24) |
      (randomness[idx++] << 16) |
      (randomness[idx++] << 8) |
      (randomness[idx++])
    ) >>> 0;
    return value / 0x100000000;
  };
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

async function generateMineGrid(grid_size, mine_count, server_secret, client_secret, nonce) {
  const mineGrid = Array(grid_size).fill(false);
  const positions = Array.from({ length: grid_size }, (_, index) => index);
  await shuffle(server_secret, client_secret, nonce, positions);
  for (let i = 0; i < mine_count; i++) mineGrid[positions[i]] = true;
  return mineGrid;
}

function readQueryParams() {
  const params = new URLSearchParams(window.location.search);
  const server_secret = params.get('server_secret') || undefined;
  const client_secret = params.get('client_secret') || undefined;
  const nonce = params.get('nonce') || undefined;
  const mine_count = params.get('mine_count') || undefined;
  const opened_mines_param = params.get('opened_mines');
  const opened_mines = opened_mines_param ? opened_mines_param.split(',').map(Number).filter(n => !isNaN(n)) : undefined;
  return { server_secret, client_secret, nonce, opened_mines, mine_count };
}

const { server_secret, client_secret, nonce, opened_mines, mine_count } = readQueryParams();
if (server_secret) document.getElementById("serversecret").value = server_secret;
if (client_secret) document.getElementById("clientsecret").value = client_secret;
if (nonce) document.getElementById("nonce").value = nonce;
if (mine_count) {
  document.getElementById("mine_count").value = +mine_count;
  document.getElementById("mine_count_value").innerText = mine_count;
}

document.getElementById("mine_count").addEventListener("input", (event) => {
  document.getElementById("mine_count_value").innerText = event.target.value;
});

async function validate() {
  const serversecretValue = document.getElementById("serversecret").value;
  const nonceValue = document.getElementById("nonce").value;
  const clientSecretValue = document.getElementById("clientsecret").value;
  const mineCount = document.getElementById("mine_count").value;
  if (!serversecretValue || !nonceValue || !clientSecretValue || !mineCount) return;
  try {
    const serverSecret = fromHexString(serversecretValue);
    const nonceBytes = uint64FromString(nonceValue);
    const gridSize = 25;
    const grid = await generateMineGrid(gridSize, +mineCount, serverSecret, clientSecretValue, nonceBytes);
    renderGrid(grid, gridSize, opened_mines);
  } catch (error) {
    document.getElementById('result').innerText = error?.message || String(error);
  }
}

if (server_secret && client_secret && nonce) validate();
document.getElementById("generateBtn").addEventListener("click", validate);



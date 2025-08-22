import { gameResult, getPreviousHash } from "./impl/crash.js";

const NUM_GAMES_THRESHOLD = 10_000;

// these are all the elements we'll be using
const elements = {
  form: document.querySelector("form#validation"),

  game_hash: document.querySelector("input#game_hash"),
  salt: document.querySelector("input#salt"),
  num_games: document.querySelector("input#num_games"),

  results_table: document.querySelector("table#results"),
  results_body: document.querySelector("table#results tbody"),

  group_validate: document.querySelector("#group_validate"),
  validate_warning: document.querySelector("#validate_warning"),

  group_progress: document.querySelector("#group_progress"),
  progress_stop: document.querySelector("#progress_stop"),
  progress_value: document.querySelector("#progress_value"),
  progress_total: document.querySelector("#progress_total"),
};

// we want to warn the user when the number of games exceeds the threshold
elements.num_games.addEventListener("input", handleNumGamesChange);
handleNumGamesChange();

elements.form.addEventListener(
  "submit",
  // wrap the function, so that errors get alerted
  wrapErrorAlert(handleSubmit, true),
);

async function handleSubmit(event) {
  event.preventDefault();

  // clear the results table and make it visible
  elements.results_table.style.display = "table";
  elements.results_body.innerHTML = "";

  // since we'll be generating a number of hashes,
  // we'll keep gameHash mutable
  let gameHash = elements.game_hash.value;
  const salt = elements.salt.value;

  // this is a helper to keep track of the progress
  const progress = createProgress(elements.num_games.value);
  for (let i = 0; i < elements.num_games.value; i++) {
    if (progress.isStopped()) break;

    const result = await gameResult(gameHash, salt);
    const row = createTableRow(gameHash, result);
    elements.results_body.appendChild(row);
    progress.update(i + 1);

    gameHash = await getPreviousHash(gameHash);
  }

  progress.done();
}

function handleNumGamesChange(event = null) {
  const target = event?.target ?? elements.num_games;
  if (target.value >= NUM_GAMES_THRESHOLD) {
    elements.validate_warning.style.display = "block";
  } else {
    elements.validate_warning.style.display = "none";
  }
}

function createTableRow(gameHash, crashPoint) {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td class="code">${gameHash}</td>
    <td class="${getCrashPointClass(crashPoint)}">
      ${crashPoint.toFixed(2)}
    </td>
  `;

  return row;
}

function createProgress(total) {
  const controller = new AbortController();
  const handler = () => controller.abort();

  elements.progress_stop.addEventListener("click", handler);
  controller.signal.addEventListener("abort", () => {
    elements.progress_stop.removeEventListener("click", handler);

    // hide the progress once we get the signal
    if (total >= NUM_GAMES_THRESHOLD) {
      elements.group_validate.style.display = "flex";
      elements.group_progress.style.display = "none";
    }
  });

  // set the initial state of progress
  elements.progress_total.innerText = total;
  if (total >= NUM_GAMES_THRESHOLD) {
    elements.group_validate.style.display = "none";
    elements.group_progress.style.display = "flex";
  }

  return {
    update: (value) => {
      elements.progress_value.innerText = value;
    },
    isStopped: () => controller.signal.aborted,
    done: () => controller.abort(),
  };
}

function getCrashPointClass(crashPoint) {
  const median = 1.98;
  if (crashPoint < median) return "is-under-median";
  if (crashPoint > median) return "is-over-median";
  return "is-at-median";
}

function wrapErrorAlert(func) {
  return async function (...args) {
    try {
      return await func(...args);
    } catch (error) {
      console.error(error);

      if (error instanceof Error) {
        alert(error.message);
        return;
      }

      if (typeof error === "string") {
        alert(error);
        return;
      }
    }
  };
}

const ROWS = 6;
const COLS = 6;

const TYPES = [
  {
    id: "sword",
    emoji: "⚔️"
  },
  {
    id: "fire",
    emoji: "🔥"
  },
  {
    id: "shield",
    emoji: "🛡️"
  },
  {
    id: "heart",
    emoji: "❤️"
  }
];

let board = [];
let selected = null;
let pointerStart = null;
let swipeHappened = false;

const boardEl =
  document.getElementById("board");

const messageEl =
  document.getElementById("message");


function wait(ms) {
  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );
}


function randomType() {
  return Math.floor(
    Math.random() * TYPES.length
  );
}


function createBoard() {

  board = [];

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    board[row] = [];

    for (
      let col = 0;
      col < COLS;
      col++
    ) {

      let type;

      do {

        type = randomType();

      } while (

        (
          col >= 2 &&
          board[row][col - 1] === type &&
          board[row][col - 2] === type
        )

        ||

        (
          row >= 2 &&
          board[row - 1][col] === type &&
          board[row - 2][col] === type
        )

      );

      board[row][col] = type;
    }
  }

  selected = null;

  ensurePlayableBoard();

  messageEl.textContent =
    "Swipe a tile or tap two adjacent tiles.";

  renderBoard();
}


function renderBoard() {

  boardEl.innerHTML = "";

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    for (
      let col = 0;
      col < COLS;
      col++
    ) {

      const tile =
        document.createElement("div");

      tile.className = "tile";

      if (
        board[row][col] !== null
      ) {

        tile.textContent =
          TYPES[
            board[row][col]
          ].emoji;
      }

      if (
        selected &&
        selected.row === row &&
        selected.col === col
      ) {

        tile.classList.add(
          "selected"
        );
      }

      addPointerControls(
        tile,
        row,
        col
      );

      boardEl.appendChild(tile);
    }
  }
}


function addPointerControls(
  tile,
  row,
  col
) {

  tile.addEventListener(
    "pointerdown",
    function (event) {

      if (
        locked ||
        gameOver
      ) {
        return;
      }

      pointerStart = {
        row: row,
        col: col,
        x: event.clientX,
        y: event.clientY
      };

      swipeHappened = false;

      try {

        tile.setPointerCapture(
          event.pointerId
        );

      } catch (error) {
      }
    }
  );


  tile.addEventListener(
    "pointerup",
    function (event) {

      if (
        locked ||
        gameOver ||
        !pointerStart
      ) {
        return;
      }

      const start =
        pointerStart;

      const dx =
        event.clientX -
        start.x;

      const dy =
        event.clientY -
        start.y;

      const distance =
        Math.max(
          Math.abs(dx),
          Math.abs(dy)
        );

      pointerStart = null;

      if (
        distance < 25
      ) {
        return;
      }

      swipeHappened = true;

      let targetRow =
        start.row;

      let targetCol =
        start.col;

      if (
        Math.abs(dx) >
        Math.abs(dy)
      ) {

        if (dx > 0) {
          targetCol++;
        } else {
          targetCol--;
        }

      } else {

        if (dy > 0) {
          targetRow++;
        } else {
          targetRow--;
        }
      }

      if (
        targetRow < 0 ||
        targetRow >= ROWS ||
        targetCol < 0 ||
        targetCol >= COLS
      ) {
        return;
      }

      attemptSwap(

        {
          row: start.row,
          col: start.col
        },

        {
          row: targetRow,
          col: targetCol
        }

      );
    }
  );


  tile.addEventListener(
    "click",
    function () {

      if (
        locked ||
        gameOver
      ) {
        return;
      }

      if (
        swipeHappened
      ) {

        swipeHappened = false;

        return;
      }

      tapTile(
        row,
        col
      );
    }
  );
}


function tapTile(
  row,
  col
) {

  if (!selected) {

    selected = {
      row: row,
      col: col
    };

    messageEl.textContent =
      "Now choose an adjacent tile.";

    renderBoard();

    return;
  }


  if (
    selected.row === row &&
    selected.col === col
  ) {

    selected = null;

    messageEl.textContent =
      "Selection cancelled.";

    renderBoard();

    return;
  }


  const distance =

    Math.abs(
      selected.row - row
    )

    +

    Math.abs(
      selected.col - col
    );


  if (
    distance !== 1
  ) {

    selected = {
      row: row,
      col: col
    };

    messageEl.textContent =
      "Choose an adjacent tile.";

    renderBoard();

    return;
  }


  const first = {
    row: selected.row,
    col: selected.col
  };

  const second = {
    row: row,
    col: col
  };

  selected = null;

  attemptSwap(
    first,
    second
  );
}


function swapTiles(
  a,
  b
) {

  const temp =
    board[a.row][a.col];

  board[a.row][a.col] =
    board[b.row][b.col];

  board[b.row][b.col] =
    temp;
}


function findMatches() {

  const matched =
    new Set();


  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    let start = 0;

    for (
      let col = 1;
      col <= COLS;
      col++
    ) {

      const current =
        col < COLS
          ? board[row][col]
          : null;

      const previous =
        board[row][col - 1];

      if (
        current !== previous
      ) {

        const length =
          col - start;

        if (
          previous !== null &&
          length >= 3
        ) {

          for (
            let x = start;
            x < col;
            x++
          ) {

            matched.add(
              row + "," + x
            );
          }
        }

        start = col;
      }
    }
  }


  for (
    let col = 0;
    col < COLS;
    col++
  ) {

    let start = 0;

    for (
      let row = 1;
      row <= ROWS;
      row++
    ) {

      const current =
        row < ROWS
          ? board[row][col]
          : null;

      const previous =
        board[row - 1][col];

      if (
        current !== previous
      ) {

        const length =
          row - start;

        if (
          previous !== null &&
          length >= 3
        ) {

          for (
            let y = start;
            y < row;
            y++
          ) {

            matched.add(
              y + "," + col
            );
          }
        }

        start = row;
      }
    }
  }

  return matched;
}


function animateMatches(
  matches
) {

  const tiles =
    boardEl.querySelectorAll(
      ".tile"
    );

  matches.forEach(
    key => {

      const parts =
        key.split(",");

      const row =
        Number(parts[0]);

      const col =
        Number(parts[1]);

      const index =
        row * COLS + col;

      if (
        tiles[index]
      ) {

        tiles[index]
          .classList
          .add(
            "matching"
          );
      }
    }
  );
}


function clearMatches(
  matches
) {

  matches.forEach(
    key => {

      const parts =
        key.split(",");

      const row =
        Number(parts[0]);

      const col =
        Number(parts[1]);

      board[row][col] =
        null;
    }
  );
}


function collapseBoard() {

  for (
    let col = 0;
    col < COLS;
    col++
  ) {

    const values = [];

    for (
      let row = ROWS - 1;
      row >= 0;
      row--
    ) {

      if (
        board[row][col] !== null
      ) {

        values.push(
          board[row][col]
        );
      }
    }

    let index = 0;

    for (
      let row = ROWS - 1;
      row >= 0;
      row--
    ) {

      if (
        index < values.length
      ) {

        board[row][col] =
          values[index];

        index++;

      } else {

        board[row][col] =
          null;
      }
    }
  }
}


function refillBoard() {

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    for (
      let col = 0;
      col < COLS;
      col++
    ) {

      if (
        board[row][col] === null
      ) {

        board[row][col] =
          randomType();
      }
    }
  }
}


function hasValidMove() {

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    for (
      let col = 0;
      col < COLS;
      col++
    ) {

      if (
        col + 1 < COLS
      ) {

        const a = {
          row: row,
          col: col
        };

        const b = {
          row: row,
          col: col + 1
        };

        swapTiles(a, b);

        const createsMatch =
          findMatches().size > 0;

        swapTiles(a, b);

        if (
          createsMatch
        ) {
          return true;
        }
      }


      if (
        row + 1 < ROWS
      ) {

        const a = {
          row: row,
          col: col
        };

        const b = {
          row: row + 1,
          col: col
        };

        swapTiles(a, b);

        const createsMatch =
          findMatches().size > 0;

        swapTiles(a, b);

        if (
          createsMatch
        ) {
          return true;
        }
      }
    }
  }

  return false;
}


function shuffleBoard() {

  const values = [];

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    for (
      let col = 0;
      col < COLS;
      col++
    ) {

      values.push(
        board[row][col]
      );
    }
  }


  for (
    let i = values.length - 1;
    i > 0;
    i--
  ) {

    const j =
      Math.floor(
        Math.random() *
        (i + 1)
      );

    const temp =
      values[i];

    values[i] =
      values[j];

    values[j] =
      temp;
  }


  let index = 0;

  for (
    let row = 0;
    row < ROWS;
    row++
  ) {

    for (
      let col = 0;
      col < COLS;
      col++
    ) {

      board[row][col] =
        values[index];

      index++;
    }
  }
}


function ensurePlayableBoard() {

  let safety = 0;

  while (
    (
      findMatches().size > 0 ||
      !hasValidMove()
    )
    &&
    safety < 200
  ) {

    shuffleBoard();

    safety++;
  }
}


async function ensurePlayableBoardAnimated() {

  if (
    hasValidMove()
  ) {
    return;
  }

  messageEl.textContent =
    "No moves — reshuffling!";

  boardEl.classList.add(
    "reshuffle"
  );

  await wait(450);

  let safety = 0;

  do {

    shuffleBoard();

    safety++;

  } while (
    (
      findMatches().size > 0 ||
      !hasValidMove()
    )
    &&
    safety < 200
  );

  boardEl.classList.remove(
    "reshuffle"
  );

  renderBoard();

  await wait(350);
}

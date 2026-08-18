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


const MAX_PLAYER_HP = 100;
const MAX_ENEMY_HP = 100;


let board = [];

let selected = null;

let pointerStart = null;

let swipeHappened = false;

let locked = false;

let gameOver = false;


let playerHp =
  MAX_PLAYER_HP;

let enemyHp =
  MAX_ENEMY_HP;

let playerShield = 0;

let comboCount = 0;


/* =========================
   DOM
========================= */

const boardEl =
  document.getElementById("board");

const messageEl =
  document.getElementById("message");

const battleMessageEl =
  document.getElementById(
    "battleMessage"
  );

const comboEl =
  document.getElementById("combo");


const playerHpBar =
  document.getElementById(
    "playerHpBar"
  );

const playerHpText =
  document.getElementById(
    "playerHpText"
  );


const enemyHpBar =
  document.getElementById(
    "enemyHpBar"
  );

const enemyHpText =
  document.getElementById(
    "enemyHpText"
  );


const shieldText =
  document.getElementById(
    "shieldText"
  );


const playerCard =
  document.getElementById(
    "playerCard"
  );

const enemyCard =
  document.getElementById(
    "enemyCard"
  );


const resetBtn =
  document.getElementById("reset");

const restartBtn =
  document.getElementById(
    "restart"
  );


/* =========================
   HELPERS
========================= */

function wait(ms) {

  return new Promise(
    resolve =>
      setTimeout(resolve, ms)
  );
}


function randomType() {

  return Math.floor(
    Math.random() *
    TYPES.length
  );
}


/* =========================
   COMBAT UI
========================= */

function updateCombatUI() {

  const playerPercent =
    Math.max(
      0,
      playerHp /
      MAX_PLAYER_HP *
      100
    );


  const enemyPercent =
    Math.max(
      0,
      enemyHp /
      MAX_ENEMY_HP *
      100
    );


  playerHpBar.style.width =
    playerPercent + "%";


  enemyHpBar.style.width =
    enemyPercent + "%";


  playerHpText.textContent =
    playerHp +
    " / " +
    MAX_PLAYER_HP +
    " HP";


  enemyHpText.textContent =
    enemyHp +
    " / " +
    MAX_ENEMY_HP +
    " HP";


  shieldText.textContent =
    "Shield: " +
    playerShield;
}


/* =========================
   NEW FIGHT
========================= */

function newFight() {

  playerHp =
    MAX_PLAYER_HP;

  enemyHp =
    MAX_ENEMY_HP;

  playerShield = 0;


  locked = false;

  gameOver = false;

  selected = null;


  restartBtn.style.display =
    "none";

  resetBtn.style.display =
    "inline-block";


  battleMessageEl.textContent =
    "Defeat the Goblin.";


  comboEl.textContent = "";


  updateCombatUI();

  createBoard();
}


/* =========================
   CREATE BOARD
========================= */

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

        type =
          randomType();

      } while (

        (
          col >= 2 &&

          board[row][col - 1]
            === type &&

          board[row][col - 2]
            === type
        )

        ||

        (
          row >= 2 &&

          board[row - 1][col]
            === type &&

          board[row - 2][col]
            === type
        )

      );


      board[row][col] =
        type;
    }
  }


  selected = null;


  messageEl.textContent =
    "Swipe a tile or tap two adjacent tiles.";


  renderBoard();
}


/* =========================
   RENDER BOARD
========================= */

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
        document.createElement(
          "div"
        );


      tile.className =
        "tile";


      if (
        board[row][col]
          !== null
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


      boardEl.appendChild(
        tile
      );
    }
  }
}


/* =========================
   INPUT
========================= */

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


      swipeHappened =
        false;


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


      pointerStart =
        null;


      if (
        distance < 25
      ) {

        return;
      }


      swipeHappened =
        true;


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

        swipeHappened =
          false;

        return;
      }


      tapTile(
        row,
        col
      );
    }
  );
}


/* =========================
   TAP
========================= */

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


/* =========================
   SWAP
========================= */

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


/* =========================
   ATTEMPT SWAP
========================= */

async function attemptSwap(
  first,
  second
) {

  if (
    locked ||
    gameOver
  ) {

    return;
  }


  locked = true;

  selected = null;


  swapTiles(
    first,
    second
  );


  renderBoard();


  await wait(150);


  const matches =
    findMatches();


  if (
    matches.size === 0
  ) {

    messageEl.textContent =
      "No match.";


    await wait(180);


    swapTiles(
      first,
      second
    );


    renderBoard();


    await wait(150);


    messageEl.textContent =
      "Try another move.";


    locked = false;

    return;
  }


  comboCount = 0;


  await resolveMatches();


  if (gameOver) {

    return;
  }


  await enemyTurn();


  if (gameOver) {

    return;
  }


  messageEl.textContent =
    "Your move.";


  comboEl.textContent =
    "";


  locked = false;
}


/* =========================
   FIND MATCHES
========================= */

function findMatches() {

  const matched =
    new Set();


  /* Horizontal */

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


        start =
          col;
      }
    }
  }


  /* Vertical */

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


        start =
          row;
      }
    }
  }


  return matched;
}


/* =========================
   RESOLVE MATCHES
========================= */

async function resolveMatches() {

  while (true) {

    const matches =
      findMatches();


    if (
      matches.size === 0
    ) {

      break;
    }


    comboCount++;


    if (
      comboCount === 1
    ) {

      comboEl.textContent =
        "MATCH!";

    } else {

      comboEl.textContent =
        "COMBO ×" +
        comboCount +
        "!";
    }


    const results =
      countMatchedTypes(
        matches
      );


    animateMatches(
      matches
    );


    await wait(250);


    applyMatchEffects(
      results
    );


    if (
      enemyHp <= 0
    ) {

      enemyHp = 0;


      updateCombatUI();


      endGame(true);


      return;
    }


    clearMatches(
      matches
    );


    collapseBoard();


    refillBoard();


    renderBoard();


    await wait(320);
  }
}


/* =========================
   COUNT MATCH TYPES
========================= */

function countMatchedTypes(
  matches
) {

  const counts = {

    sword: 0,

    fire: 0,

    shield: 0,

    heart: 0

  };


  matches.forEach(
    key => {

      const parts =
        key.split(",");


      const row =
        Number(parts[0]);


      const col =
        Number(parts[1]);


      const typeIndex =
        board[row][col];


      const typeId =
        TYPES[typeIndex].id;


      counts[typeId]++;
    }
  );


  return counts;
}


/* =========================
   APPLY MATCH EFFECTS
========================= */

function applyMatchEffects(
  counts
) {

  let totalDamage = 0;


  const swordDamage =
    counts.sword * 10;


  const fireDamage =
    counts.fire * 15;


  totalDamage +=

    swordDamage +

    fireDamage;


  if (
    totalDamage > 0
  ) {

    enemyHp -=
      totalDamage;


    if (
      enemyHp < 0
    ) {

      enemyHp = 0;
    }


    enemyCard.classList.remove(
      "hurt"
    );


    void enemyCard.offsetWidth;


    enemyCard.classList.add(
      "hurt"
    );


    battleMessageEl.textContent =

      "You deal " +

      totalDamage +

      " damage!";
  }


  if (
    counts.heart > 0
  ) {

    const healAmount =
      counts.heart * 8;


    const oldHp =
      playerHp;


    playerHp =
      Math.min(

        MAX_PLAYER_HP,

        playerHp +
        healAmount

      );


    const actualHeal =
      playerHp -
      oldHp;


    playerCard.classList.remove(
      "heal"
    );


    void playerCard.offsetWidth;


    playerCard.classList.add(
      "heal"
    );


    if (
      totalDamage === 0
    ) {

      battleMessageEl.textContent =

        "You heal " +

        actualHeal +

        " HP!";
    }
  }


  if (
    counts.shield > 0
  ) {

    const shieldGain =
      counts.shield * 8;


    playerShield +=
      shieldGain;


    if (
      totalDamage === 0 &&
      counts.heart === 0
    ) {

      battleMessageEl.textContent =

        "You gain " +

        shieldGain +

        " shield!";
    }
  }


  updateCombatUI();
}


/* =========================
   MATCH ANIMATION
========================= */

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
        row * COLS +
        col;


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


/* =========================
   CLEAR MATCHES
========================= */

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


/* =========================
   COLLAPSE BOARD
========================= */

function collapseBoard() {

  for (
    let col = 0;
    col < COLS;
    col++
  ) {

    const values =
      [];


    for (
      let row = ROWS - 1;
      row >= 0;
      row--
    ) {

      if (
        board[row][col]
          !== null
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
        index <
        values.length
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


/* =========================
   REFILL BOARD
========================= */

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
        board[row][col]
          === null
      ) {

        board[row][col] =
          randomType();
      }
    }
  }
}


/* =========================
   ENEMY TURN
========================= */

async function enemyTurn() {

  locked = true;


  battleMessageEl.textContent =
    "Goblin attacks!";


  await wait(450);


  const enemyDamage =
    14;


  let damageLeft =
    enemyDamage;


  if (
    playerShield > 0
  ) {

    const blocked =
      Math.min(

        playerShield,

        damageLeft

      );


    playerShield -=
      blocked;


    damageLeft -=
      blocked;
  }


  if (
    damageLeft > 0
  ) {

    playerHp -=
      damageLeft;


    if (
      playerHp < 0
    ) {

      playerHp = 0;
    }


    playerCard.classList.remove(
      "hurt"
    );


    void playerCard.offsetWidth;


    playerCard.classList.add(
      "hurt"
    );
  }


  updateCombatUI();


  await wait(350);


  if (
    playerHp <= 0
  ) {

    endGame(false);

    return;
  }


  battleMessageEl.textContent =
    "Your turn.";
}


/* =========================
   END GAME
========================= */

function endGame(
  playerWon
) {

  gameOver = true;

  locked = true;


  comboEl.textContent =
    "";


  resetBtn.style.display =
    "none";


  restartBtn.style.display =
    "inline-block";


  if (
    playerWon
  ) {

    battleMessageEl.textContent =
      "VICTORY!";


    messageEl.textContent =
      "The Goblin is defeated.";

  } else {

    battleMessageEl.textContent =
      "DEFEATED";


    messageEl.textContent =
      "The Goblin defeated you.";
  }
}


/* =========================
   BUTTONS
========================= */

resetBtn.addEventListener(
  "click",
  function () {

    if (
      locked ||
      gameOver
    ) {

      return;
    }


    createBoard();
  }
);


restartBtn.addEventListener(
  "click",
  newFight
);


/* =========================
   START
========================= */

newFight();

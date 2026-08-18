const resetBtn =
  document.getElementById(
    "reset"
  );

const restartBtn =
  document.getElementById(
    "restart"
  );


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

  comboEl.textContent =
    "";

  updateCombatUI();

  createBoard();
}


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


  if (
    gameOver
  ) {
    return;
  }


  await ensurePlayableBoardAnimated();


  if (
    gameOver
  ) {
    return;
  }


  await enemyTurn();


  if (
    gameOver
  ) {
    return;
  }


  messageEl.textContent =
    "Your move.";

  comboEl.textContent =
    "";

  locked = false;
}


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


newFight();

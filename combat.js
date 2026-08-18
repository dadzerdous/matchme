const MAX_PLAYER_HP = 100;
const MAX_ENEMY_HP = 100;

let playerHp =
  MAX_PLAYER_HP;

let enemyHp =
  MAX_ENEMY_HP;

let playerShield = 0;

let comboCount = 0;

let locked = false;
let gameOver = false;


const battleMessageEl =
  document.getElementById(
    "battleMessage"
  );

const comboEl =
  document.getElementById(
    "combo"
  );

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


function showFloatingText(
  target,
  text,
  className
) {

  const floating =
    document.createElement(
      "div"
    );

  floating.className =
    "floating-text " +
    className;

  floating.textContent =
    text;

  target.appendChild(
    floating
  );

  setTimeout(
    function () {

      floating.remove();

    },
    900
  );
}


function showEnemyTurnBanner() {

  const banner =
    document.createElement(
      "div"
    );

  banner.className =
    "turn-banner";

  banner.textContent =
    "ENEMY TURN";

  document.body.appendChild(
    banner
  );

  setTimeout(
    function () {

      banner.remove();

    },
    800
  );
}


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


function applyMatchEffects(
  counts
) {

  let totalDamage = 0;

  const swordDamage =
    counts.sword * 10;

  const fireDamage =
    counts.fire * 15;

  totalDamage =
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

    showFloatingText(
      enemyCard,
      "-" + totalDamage,
      "damage-text"
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
        playerHp + healAmount
      );

    const actualHeal =
      playerHp - oldHp;

    playerCard.classList.remove(
      "heal"
    );

    void playerCard.offsetWidth;

    playerCard.classList.add(
      "heal"
    );

    if (
      actualHeal > 0
    ) {

      showFloatingText(
        playerCard,
        "+" + actualHeal,
        "heal-text"
      );
    }
  }


  if (
    counts.shield > 0
  ) {

    const shieldGain =
      counts.shield * 8;

    playerShield +=
      shieldGain;
  }

  updateCombatUI();
}


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


async function enemyTurn() {

  locked = true;

  showEnemyTurnBanner();

  battleMessageEl.textContent =
    "Goblin prepares to attack!";

  await wait(500);

  enemyCard.classList.remove(
    "enemy-lunge"
  );

  enemyCard.classList.remove(
    "enemy-flash"
  );

  void enemyCard.offsetWidth;

  enemyCard.classList.add(
    "enemy-lunge"
  );

  enemyCard.classList.add(
    "enemy-flash"
  );

  await wait(300);


  const enemyDamage = 14;

  let damageLeft =
    enemyDamage;

  let blocked = 0;


  if (
    playerShield > 0
  ) {

    blocked =
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
    blocked > 0
  ) {

    showFloatingText(
      playerCard,
      "BLOCK " + blocked,
      "block-text"
    );
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

    playerCard.classList.remove(
      "player-hit-flash"
    );

    void playerCard.offsetWidth;

    playerCard.classList.add(
      "hurt"
    );

    playerCard.classList.add(
      "player-hit-flash"
    );

    showFloatingText(
      playerCard,
      "-" + damageLeft,
      "damage-text"
    );

    battleMessageEl.textContent =
      "Goblin hits for " +
      damageLeft +
      " damage!";

  } else {

    battleMessageEl.textContent =
      "Your shield blocks the attack!";
  }


  updateCombatUI();

  await wait(650);


  enemyCard.classList.remove(
    "enemy-lunge"
  );

  enemyCard.classList.remove(
    "enemy-flash"
  );

  playerCard.classList.remove(
    "player-hit-flash"
  );


  if (
    playerHp <= 0
  ) {

    endGame(false);

    return;
  }

  battleMessageEl.textContent =
    "Your turn.";
}

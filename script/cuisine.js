var tableWidth = isMobile() ? Math.floor(204 / 2) : Math.floor(204 / 1);
var tableHeight = isMobile() ? 31 : 63;
var table;
var cabbageWidth = isMobile() ? 26 : 53;
var cabbageHeight = isMobile() ? 21 : 43;
var sausageWidth = isMobile() ? 59 : 118;
var sausageHeight = isMobile() ? 25 : 49;
var nbRow = 5;
var nbCol = 10;
var sausages = [];
var cabbages = [];
var gameContainerRect, maxWidth, maxValue;
var isDragging = false;
var dragStart;
var cuisineGameIntervalRef = null;
var startTime;
var sausageDestroyed = 0;
const specialEffects = [
  {
    name: "speed",
    needed: 4,
    function: (cabbage) => {
      // Speed increase
      cabbage.speed *= 1.5;
      cabbage.speed = Math.round(cabbage.speed);
      setTimeout(() => {
        cabbage.speed /= 1.5;
        cabbage.speed = Math.round(cabbage.speed);
      }, 3500);
    },
  },
  {
    name: "double",
    needed: 2,
    function: (cabbage) => {
      // Duplicate cabbage
      const newCabbage = cabbage.cloneNode(true);
      newCabbage.id = "";
      newCabbage.direction = Math.PI - cabbage.direction;
      newCabbage.speed = cabbage.speed;
      newCabbage.left = cabbage.left;
      newCabbage.top = cabbage.top;
      document
        .querySelector("#cuisine #game-container")
        .appendChild(newCabbage);
      cabbages.push(newCabbage);
    },
  },
  {
    name: "explosion",
    needed: 4,
    function: (cabbage, sausage) => {
      // Sausage explosion
      const index = sausages.indexOf(sausage);
      if (index < 0) {
        consolele.log("no index...");
        return;
      }
      // find sausages on top/left/right/bottom if they exists
      const sausagesNb = sausages.length;
      const nbCol = sausagesNb / nbRow;
      const left = index % nbCol != 0 ? sausages[index - 1] : null;
      const right = index % nbCol != nbCol - 1 ? sausages[index + 1] : null;
      const top = index - nbCol >= 0 ? sausages[index - nbCol] : null;
      const bottom =
        index + nbCol < sausagesNb ? sausages[index + nbCol] : null;
      const toExplode = [top, left, right, bottom].filter((s) => s && !s.dead);
      toExplode.forEach((s) => {
        s.dead = true;
        const secSinceStart = (new Date() - startTime) / 1000;
        const explosion = document
          .getElementById("explosion-template")
          .cloneNode(true);
        explosion.id = "";
        explosion.style.left = `${s.x}px`;
        explosion.style.top = `${s.y}px`;
        document
          .querySelector("#cuisine #game-container")
          .appendChild(explosion);
        setTimeout(() => {
          explosion.remove();
        }, 1000);
        currentScore += Math.ceil(1000 / secSinceStart);
        if (s.specialEffect) {
          s.specialEffect(cabbage, s);
        }
        s.sausage.remove();
      });
    },
  },
  {
    name: "add",
    needed: 3,
    function: (cabbage, sausage) => {
      // Find indexs where sausage isDead
      const maxNew = 4;
      const deadSausages = sausages.filter((s) => s.dead && s !== sausage);
      if (deadSausages.length <= maxNew) {
        deadSausages.forEach((s) => {
          s.dead = false;
          document
            .querySelector("#cuisine #sausage-bricks")
            .appendChild(s.sausage);
        });
      } else {
        for (let i = 0; i < maxNew; i++) {
          var rndIndex = Math.floor(Math.random() * deadSausages.length);
          while (!deadSausages[rndIndex].dead)
            rndIndex = Math.floor(Math.random() * deadSausages.length);
          deadSausages[rndIndex].dead = false;
          document
            .querySelector("#cuisine #sausage-bricks")
            .appendChild(deadSausages[rndIndex].sausage);
        }
      }
    },
  },
];

function loadCuisine() {
  particlePool.extinguishParticles();
  setNewCursor("");
  play("fire");

  currentScore = 0;
  table = document.getElementById("table");
  table.style.width = `${tableWidth}px`;
  table.style.height = `${tableHeight}px`;

  const cabbage = document.getElementById("cabbage");
  cabbage.style.width = `${cabbageWidth}px`;
  cabbage.style.height = `${cabbageHeight}px`;
  cabbages.push(cabbage);

  gameContainerRect = document
    .querySelector("#cuisine #game-container")
    .getBoundingClientRect();
  maxWidth = gameContainerRect.width;
  maxValue = 1 - tableWidth / maxWidth;
  cabbage.speed = 0;
  movetable(0.5);

  const gameContainer = document.querySelector("#cuisine #game-container");

  // Scroll game container into view
  gameContainer.scrollIntoView({ behavior: "smooth" });

  initSausageGrid();

  cuisineGameIntervalRef = setInterval(cuisineGameInterval, 1000 / 30);

  if (isMobile()) {
    table.addEventListener("touchstart", tableFollow, {
      passive: false,
    });
    table.addEventListener("touchmove", tableFollow, {
      passive: false,
    });
    table.addEventListener("touchend", launchCabbage, {
      passive: false,
    });
  } else {
    gameContainer.addEventListener("mousemove", tableFollow);
    gameContainer.addEventListener("mouseup", launchCabbage);
  }
}

function unloadCuisine() {
  resetCursor();
  const gameContainer = document.querySelector("#cuisine #game-container");

  table.removeEventListener("touchstart", tableFollow, {
    passive: false,
  });
  table.removeEventListener("touchend", launchCabbage, {
    passive: false,
  });
  table.removeEventListener("touchmove", tableFollow, {
    passive: false,
  });
  gameContainer.removeEventListener("mousemove", tableFollow);
  gameContainer.removeEventListener("mouseup", launchCabbage);
  clearInterval(cuisineGameIntervalRef);
  sausages.forEach((s) => s.sausage.remove());
  sausages = [];
}

function initSausageGrid() {
  const sausageTemplate = document.getElementById("sausage-template");
  const sausageContainer = document.getElementById("sausage-bricks");
  const yStart = gameContainerRect.height * 0.1;
  // can fit in width ?
  if (gameContainerRect.width / nbCol < sausageWidth) {
    let fitCol = Math.floor(gameContainerRect.width / sausageWidth);
    nbRow = Math.ceil((nbCol * nbRow) / fitCol);
    nbCol = fitCol;
  }
  const widthReduction =
    (sausageWidth - gameContainerRect.width / nbCol) / sausageWidth;

  sausageWidth = gameContainerRect.width / nbCol;
  sausageHeight = sausageHeight * (1 - widthReduction);

  for (let row = 0; row < nbRow; row++) {
    for (let col = 0; col < nbCol; col++) {
      const sausage = sausageTemplate.cloneNode(true);
      sausage.id = "";
      sausage.style.width = `${sausageWidth}px`;
      sausage.style.height = `${sausageHeight}px`;
      sausage.style.left = `${col * sausageWidth}px`;
      sausage.style.top = `${yStart + row * sausageHeight}px`;
      sausageContainer.appendChild(sausage);
      sausages.push({
        sausage,
        x: col * sausageWidth,
        y: yStart + row * sausageHeight,
      });
    }
  }

  // Add special sausages
  for (let special of specialEffects) {
    for (let i = 0; i < special.needed; i++) {
      var rndIndex = Math.floor(Math.random() * sausages.length);
      while (sausages[rndIndex].specialEffect) {
        rndIndex = Math.floor(Math.random() * sausages.length);
      }
      sausages[rndIndex].specialEffect = special.function;
      sausages[rndIndex].sausage.classList.add("special");
      sausages[rndIndex].sausage.classList.add(special.name);
    }
  }
}

function launchCabbage() {
  const gameContainer = document.querySelector("#cuisine #game-container");

  table.removeEventListener("touchend", launchCabbage, {
    passive: false,
  });
  gameContainer.removeEventListener("mouseup", launchCabbage);
  const cabbage = cabbages[0];
  cabbage.speed = gameContainerRect.height / 40;
  cabbage.direction = Math.PI / 2;
  repeatAudio("la-soupe-aux-choux");
  startTime = new Date();
  currentScore = 0;
}

function cuisineGameInterval() {
  // Move cabbage and bounce off gameContainer walls
  const _tableRect = table.getBoundingClientRect();

  // table relative to game container
  const tableRect = {
    x: _tableRect.left - gameContainerRect.left,
    y: gameContainerRect.height - tableHeight,
    width: tableWidth,
    height: tableHeight,
  };
  for (let cabbage of cabbages) {
    if (cabbage.speed > 0) {
      let addedX = parseFloat(
        (Math.cos(cabbage.direction) * cabbage.speed).toFixed(2)
      );
      let addedY = parseFloat(
        (Math.sin(cabbage.direction) * cabbage.speed).toFixed(2)
      );

      let newX = parseFloat((cabbage.left + addedX).toFixed(2));
      let newY = parseFloat((cabbage.top - addedY).toFixed(2));
      // Check collision with left and right walls
      if (newX < 0 || newX + cabbageWidth > gameContainerRect.width) {
        cabbage.direction = Math.PI - cabbage.direction;
        newX = newX < 0 ? 0 : gameContainerRect.width - cabbageWidth;
      }
      // Check collision with top walls
      if (newY < 0) {
        cabbage.direction = -cabbage.direction;
        newY = newY < 0 ? 0 : gameContainerRect.height - cabbageHeight;
      }

      // Check collision with sausage
      const sausagesToCheck = sausages.filter((s) => !s.dead).reverse();
      for (let s of sausagesToCheck) {
        const collision = detectCollision(
          { x: s.x, y: s.y, width: sausageWidth, height: sausageHeight },
          {
            x: newX,
            y: newY,
            width: cabbageWidth,
            height: cabbageHeight,
          }
        );
        if (collision != "NONE") {
          s.dead = true;
          s.sausage.remove();
          const secSinceStart = (new Date() - startTime) / 1000;
          // Increase score depending on time since start, the longer the duration the less points
          currentScore += Math.ceil(1000 / secSinceStart);

          switch (collision) {
            case "LEFT":
              cabbage.direction = Math.PI - cabbage.direction;
              cabbage.x = s.x - cabbageWidth;
              break;
            case "RIGHT":
              cabbage.direction = Math.PI - cabbage.direction;
              cabbage.x = s.x + sausageWidth;
              break;
            case "TOP":
              cabbage.direction = -cabbage.direction;
              cabbage.y = s.y - cabbageHeight;
              break;
            case "BOTTOM":
              cabbage.direction = -cabbage.direction;
              cabbage.y = s.y + sausageHeight;
              break;
          }
          if (s.specialEffect) {
            s.specialEffect(cabbage, s);
          }
          break;
        }
      }

      // Check collision with table
      if (
        newX < tableRect.x + tableRect.width &&
        newX + cabbageWidth > tableRect.x &&
        newY < tableRect.y + tableRect.height &&
        newY + cabbageHeight > tableRect.y
      ) {
        // Set new direction depending on collision with table
        const tableCenter = tableRect.x + tableWidth / 2;
        const cabbageCenter = cabbage.left + cabbageWidth / 2;
        const distance = cabbageCenter - tableCenter;
        const ratio = distance / (tableWidth / 2);
        cabbage.direction = Math.PI / 2 - (ratio * Math.PI) / 2;
        newY = tableRect.y - cabbageHeight;
      }
      // Normalize cabbage direction
      arrangeCabbageDirection(cabbage);

      cabbage.left = newX;
      cabbage.top = newY;
      cabbage.style.left = `${newX}px`;
      cabbage.style.top = `${newY}px`;
    }
    // Check collision with bottom
    if (cabbage.top + cabbageHeight > gameContainerRect.height) {
      loose(cabbage);
    }
  }
  document.querySelectorAll("#cuisine .score").forEach((elt) => {
    elt.innerText = currentScore;
  });
  document.querySelectorAll("#cuisinepopup .score").forEach((elt) => {
    elt.innerText = currentScore;
  });

  if (sausages.every((s) => s.dead)) {
    win();
  }
  //   const follower = document.getElementById("debug");
  //   // follow sausage
  //   follower.style.top = `${tableRect.y}px`;
  //   follower.style.left = `${tableRect.x}px`;
  //   follower.style.width = `${tableWidth}px`;
  //   follower.style.height = `${tableHeight}px`;
}

function tableFollow(event) {
  var x = isMobile()
    ? event.touches[0].clientX
    : event.clientX - gameContainerRect.x;
  var xRatio = x / maxWidth;
  if (isMobile()) {
    event.preventDefault();
    if (event.type === "touchstart") {
      dragStart = xRatio;
      return;
    } else if (event.type == "touchmove") {
      isDragging = true;
      // xRatio = table.currentPosition + (xRatio - dragStart) / 3;
    }
  }
  movetable(xRatio);
}

function movetable(value) {
  if (value < 0) value = 0;
  if (value > maxValue) value = maxValue;
  if (table) {
    table.currentPosition = value;
    table.style.transform = `translateX(${Math.floor(value * maxWidth)}px)`;
    const cabbage = cabbages[0];
    if (cabbage.speed === 0) {
      const tableRect = table.getBoundingClientRect();
      cabbage.left =
        tableRect.left -
        gameContainerRect.left +
        tableWidth / 2 -
        cabbageWidth / 2;
      cabbage.top = gameContainerRect.height - tableHeight - cabbageHeight;
      cabbage.style.left = `${cabbage.left}px`;
      cabbage.style.top = `${cabbage.top}px`;
    }
  }
}

function detectCollision(r1, r2) {
  var dx = r1.x + r1.width / 2 - (r2.x + r2.width / 2);
  var dy = r1.y + r1.height / 2 - (r2.y + r2.height / 2);
  var width = (r1.width + r2.width) / 2;
  var height = (r1.height + r2.height) / 2;
  var crossWidth = width * dy;
  var crossHeight = height * dx;
  var collision = "NONE";
  //
  if (Math.abs(dx) <= width && Math.abs(dy) <= height) {
    if (crossWidth > crossHeight) {
      collision = crossWidth > -crossHeight ? "BOTTOM" : "LEFT";
    } else {
      collision = crossWidth > -crossHeight ? "RIGHT" : "TOP";
    }
  }
  return collision;
}

function loose(cabbage) {
  if (cabbages.length > 1) {
    cabbages.splice(cabbages.indexOf(cabbage), 1);
    cabbage.remove();
    return;
  }
  if (!isMobile()) {
    resetCursor();
    disableBurstOnClick();
  }

  commonEndGame();
  // Loose screen
  document.getElementById("cuisinepopup").setAttribute("role", "loose");
}

function win() {
  commonEndGame();
  document.getElementById("cuisinepopup").setAttribute("role", "win");
  const currentHighScore = getHighScore();
  if (currentScore > currentHighScore) {
    setNewHighScore(currentScore);
    document.getElementById("cuisinepopup").setAttribute("role", "highscore");
  }
}

function commonEndGame() {
  if (!isMobile()) {
    resetCursor();
    disableBurstOnClick();
  }
  play("fire");
  clearInterval(cuisineGameIntervalRef);
  document.body.scrollIntoView();
  lockScroll();
  const hs = getHighScore();
  document
    .querySelectorAll("#cuisinepopup .highscore")
    .forEach((elt) => (elt.innerText = hs));
}

function resetCuisineGame() {
  unlockScroll();
  const gameContainer = document.querySelector("#cuisine #game-container");
  gameContainer.scrollIntoView({ behavior: "smooth" });
  document.getElementById("cuisinepopup").removeAttribute("role");
  cabbages.forEach((c) => c.remove());
  cabbages.splice(1, cabbages.length);
  const cabbage = cabbages[0];
  gameContainer.appendChild(cabbage);
  cabbage.speed = 0;
  const tableRect = table.getBoundingClientRect();
  cabbage.left = tableRect.left;
  cabbage.top = gameContainerRect.height - tableHeight - cabbageHeight;
  cabbage.style.left = `${tableRect.x + tableWidth / 2 - cabbageWidth / 2}px`;
  cabbage.style.top = `${tableRect.y - cabbageHeight}px`;

  if (isMobile())
    table.addEventListener("touchend", launchCabbage, {
      passive: false,
    });
  else gameContainer.addEventListener("mouseup", launchCabbage);
  sausages.forEach((s) => s.sausage.remove());
  sausages = [];
  initSausageGrid();
  cuisineGameIntervalRef = setInterval(cuisineGameInterval, 1000 / 30);
}

function arrangeCabbageDirection(cabbage) {
  const norm = normalizeAngle(cabbage.direction);
  const angleThreshold = Math.PI / 16;
  const toCheck = [Math.PI, 0];
  for (let a of toCheck) {
    if (Math.abs(norm - a) < angleThreshold) {
      cabbage.direction = a + (norm > a ? angleThreshold : -angleThreshold);
      return;
    }
  }
}

function getHighScore() {
  const hs = localStorage.getItem("cuisineHighScore");
  return hs ? parseInt(hs) : 0;
}
function setNewHighScore(score) {
  localStorage.setItem("cuisineHighScore", score);
}

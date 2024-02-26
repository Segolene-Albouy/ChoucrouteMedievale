const crossbowWidth = isMobile() ? 61 : 122;
const crossbowHeight = isMobile() ? 72 : 144;
var maxWidth = window.screen.availWidth || window.screen.width;
var crossbow;
var isDragging = false;
var gameIntervalRef = null;
var currentScore = 0;

function loadHerse() {
  particlePool.extinguishParticles();
  setNewCursor("");
  play("fire");

  currentScore = 0;
  crossbow = document.getElementById("crossbow");
  crossbow.style.width = `${crossbowWidth}px`;
  crossbow.style.height = `${crossbowHeight}px`;

  // Set crossbow at center
  moveCrossbow(0.5);
  maxWidth = document.getElementById("herse").clientWidth;

  gameIntervalRef = setInterval(gameInterval, 1000 / 60);

  if (isMobile()) {
    const arrow = document.getElementById("arrow-template");
    arrow.style.width = "8px";
    arrow.style.height = "56px";

    const mendiant = document.getElementById("mendiant-template");
    mendiant.style.width = "79px";
    mendiant.style.height = "80px";

    document.addEventListener("touchmove", crossbowFollow, { passive: false });
    document.addEventListener("touchend", fireArrow, { passive: false });
  } else {
    const mendiant = document.getElementById("mendiant-template");
    mendiant.style.width = "158px";
    mendiant.style.height = "159px";
    document.addEventListener("mousemove", crossbowFollow);
    document.addEventListener("mouseup", fireArrow);
  }
}

function unloadHerse() {
  resetCursor();
  //   unlockScroll();
  document.removeEventListener("touchmove", crossbowFollow, { passive: false });
  document.removeEventListener("touchend", fireArrow, { passive: false });
  document.removeEventListener("mousemove", crossbowFollow);
  document.removeEventListener("mouseup", fireArrow);
  clearInterval(gameIntervalRef);
}

function fireArrow(event) {
  event.preventDefault();
  if (isMobile() && isDragging) {
    isDragging = false;
    return;
  }

  const arrow = arrowPool.newArrow();
  arrow.currentPosition = crossbow.getBoundingClientRect().top;
  arrow.style.left =
    Math.floor(crossbow.currentPosition * maxWidth + crossbowWidth / 2) + "px";
}

function crossbowFollow(event) {
  isDragging = true;
  const x = isMobile() ? event.touches[0].clientX : event.clientX;
  // xRatio with
  const xRatio = x / maxWidth;
  moveCrossbow(xRatio);
}

// 0 < value < 1 => 0 bord gauche de l'écran, 1  = bord droit
function moveCrossbow(value) {
  if (value < 0) value = 0;
  if (value > 1) value = 1;
  if (crossbow) {
    crossbow.currentPosition = value;
    crossbow.style.transform = `translateX(${Math.floor(value * maxWidth)}px)`;
  }
}

const arrowPool = {
  max: 10,
  pool: [],
  newArrow: () => {
    const arrow = document.getElementById("arrow-template").cloneNode(true);
    arrow.id = "";
    arrowPool.pool.push(arrow);
    document.getElementById("game-container").appendChild(arrow);
    return arrow;
  },
  removeArrow: (arrow) => {
    console.log("remove arrow");
    arrow.remove();
    arrowPool.pool.splice(arrowPool.pool.indexOf(arrow), 1);
  },
};

const peoplePool = {
  pool: [],
  newPerson: (person) => {
    peoplePool.pool.push(person);
    document.getElementById("game-container").appendChild(person);
  },
  removePerson: (person) => {
    person.remove();
    peoplePool.pool.splice(peoplePool.pool.indexOf(person), 1);
  },
};

var mendiantSpawnChance = 0.005;
const mendiantKillScore = 10;
const mendiantWinScore = -20;
var damselSpawnChance = 0.005;
const damselKillScore = -40;
const damselWinScore = 20;

function gameInterval() {
  peoplePool.pool.forEach((person) => {
    // Check arrow overlap mendiant
    arrowPool.pool.forEach((arrow) => {
      const isMendiant = person.classList.contains("mendiant");
      if (isOverlap(arrow, person) && !person.classList.contains("hurt")) {
        arrowPool.removeArrow(arrow);
        person.classList.add("hurt" + (isMobile() ? "-mobile" : ""));

        setTimeout(() => {
          person.classList.remove("hurt" + (isMobile() ? "-mobile" : ""));
        }, 1000);

        person.damage++;
        if (person.damage >= 2) {
          peoplePool.removePerson(person);
          if (isMendiant) {
            playShort(
              mendiantSounds.hurt[
                Math.floor(Math.random() * mendiantSounds.hurt.length)
              ]
            );
          }
          currentScore += isMendiant ? mendiantKillScore : damselKillScore;
          return;
        }
      }
    });
  });

  // Update arrows
  arrowPool.pool.forEach((arrow) => {
    arrow.currentPosition += 10;
    arrow.style.top = arrow.currentPosition + "px";
    if (arrow.currentPosition > window.screen.height) {
      arrowPool.removeArrow(arrow);
    }
  });

  // Update people
  peoplePool.pool.forEach((person) => {
    person.currentPosition -= 1;
    person.style.top = person.currentPosition + "px";
    if (person.currentPosition < 0) {
      // Reach castle
      if (person.classList.contains("mendiant")) {
        document.getElementById("castle").classList.add("hurt");
        playShort(
          mendiantSounds.win[
            Math.floor(Math.random() * mendiantSounds.win.length)
          ]
        );
        setTimeout(() => {
          document.getElementById("castle").classList.remove("hurt");
        }, 500);
        currentScore += mendiantWinScore;
      } else {
        currentScore += damselWinScore;
      }
      peoplePool.removePerson(person);
    }
  });

  document.getElementById("score").innerText = currentScore;

  let rnd = Math.random();
  // Spawn mendiant
  if (rnd < mendiantSpawnChance) {
    const mendiant = document
      .getElementById("mendiant-template")
      .cloneNode(true);
    mendiant.id = "";
    mendiant.style.display = "block";
    mendiant.style.left = randomBetween(0, maxWidth * 0.8) + "px";
    mendiant.style.top = window.screen.height + "px";
    mendiant.currentPosition = window.screen.height;
    mendiant.damage = 0;
    playShort(
      mendiantSounds.spawn[
        Math.floor(Math.random() * mendiantSounds.spawn.length)
      ]
    );
    peoplePool.newPerson(mendiant);
  }
  rnd = Math.random();
  if (rnd < damselSpawnChance) {
    const damsel = document.getElementById("damsel-template").cloneNode(true);
    damsel.id = "";
    damsel.style.display = "block";
    damsel.style.left = randomBetween(0, maxWidth * 0.8) + "px";
    damsel.style.top = window.screen.height + "px";
    damsel.currentPosition = window.screen.height;
    damsel.damage = 0;
    const rndImg = damselImgs[Math.floor(Math.random() * damselImgs.length)];
    damsel.style.width =
      Math.floor(isMobile() ? rndImg.width / 2 : rndImg.width) + "px";
    damsel.style.height =
      Math.floor(isMobile() ? rndImg.height / 2 : rndImg.height) + "px";
    damsel.src = `static/lookbook/${rndImg.src}`;
    peoplePool.newPerson(damsel);
  }
}

function isOverlap(element1, element2) {
  const rect1 = element1.getBoundingClientRect();
  const rect2 = element2.getBoundingClientRect();
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}

const mendiantSounds = {
  spawn: ["ouille_les_geux", "ouille_bourguignon"],
  hurt: ["ouille_ok"],
  win: ["ouille_cest_laid"],
};

const damselImgs = [
  { src: "bergere.png", width: 492 / 4, height: 708 / 4 },
  { src: "escoffion-boule.png", width: 557 / 4, height: 727 / 4 },
  { src: "escoffion.png", width: 596 / 4, height: 666 / 4 },
];
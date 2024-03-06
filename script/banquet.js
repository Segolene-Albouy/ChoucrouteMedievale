const cabbage = {
  width: isMobile() ? 53 * 0.75 : 53,
  height: isMobile() ? 43 * 0.75 : 43,
  src: "static/cabbage.png",
  x: 50,
  y: 0,
  velocity: 0,
  jumpStrength: isMobile() ? -10 : -11.5,
  image: null,

  jump: function () {
    this.velocity = this.jumpStrength;
  },

  update: function () {
    this.velocity += gravity;
    this.y += this.velocity;
  },

  draw: function (debug = false) {
    ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
    if (debug) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(this.x, this.y, this.width, this.height);
    }
  },
};

const mobileRatio = 0.75;

const knifeAndFork = {
  width: isMobile() ? 46 * mobileRatio : 46,
  knife: "static/knife.png",
  fork: "static/fork.png",
  gap: isMobile() ? 200 : 270,
  speed: isMobile() ? 4 : 6,
  pipesGap: () => floorRandomBetween(canvas.height * 0.1, canvas.height * 0.8),
  newPipe: (
    x = pipes[pipes.length - 1].x + knifeAndFork.gap + knifeAndFork.width
  ) => {
    let gap = knifeAndFork.pipesGap();
    return new Pipe(x, gap);
  },
  heights: () => {
    const forkHeight = isMobile()
      ? knifeAndFork.forkImage.height * 2 * mobileRatio
      : knifeAndFork.forkImage.height * 2;
    const knifeHeight = isMobile()
      ? knifeAndFork.knifeImage.height * 2 * mobileRatio
      : knifeAndFork.knifeImage.height * 2;
    return { forkHeight, knifeHeight };
  },
};

var canvas, ctx;
var loadedOnce = false;
const gravity = 0.5;
var pipes = [];
var currentScore = 0,
  highScore = 0;

function loadBanquet() {
  if (!loadedOnce) {
    canvas = document.querySelector("#banquet canvas");
    ctx = canvas.getContext("2d");
    cabbage.image = new Image();
    cabbage.image.src = cabbage.src;
    knifeAndFork.forkImage = new Image();
    knifeAndFork.forkImage.src = knifeAndFork.fork;
    knifeAndFork.knifeImage = new Image();
    knifeAndFork.knifeImage.src = knifeAndFork.knife;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    loadedOnce = true;
  }
  disableBurstOnClick();
  banquetSetup();
  getDBHighScore(localStorage.getItem("medievalName")).then((res) => {
    if (res.banquet) highScore = res.banquet;
  });
}

function startBanquetGame(event) {
  pipes = Array(Math.ceil(canvas.offsetWidth / knifeAndFork.gap))
    .fill()
    .map((a, i) => knifeAndFork.newPipe(canvas.offsetWidth + i * 300));
  if (isMobile()) {
    canvas.removeEventListener("touchstart", startBanquetGame);
    canvas.addEventListener("touchstart", cabbageJump);
  } else {
    canvas.removeEventListener("mousedown", startBanquetGame);
    canvas.addEventListener("mousedown", cabbageJump);
  }
  banquetLoop();
}

function banquetSetup() {
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  document.getElementById("banquetpopup").style.display = "none";
  cabbage.y = canvas.offsetHeight / 2 - cabbage.height / 2;
  if (isMobile()) {
    canvas.addEventListener("touchstart", startBanquetGame);
  } else {
    canvas.addEventListener("mousedown", startBanquetGame);
  }
  canvas.scrollIntoView({ behavior: "smooth" });
  cabbage.draw();
  currentScore = 0;
  renderScore();
}

function banquetLoop() {
  // Update
  cabbage.update();

  var hasCollided = false;

  // Move pipes
  pipes.forEach((pipe) => {
    pipe.x -= knifeAndFork.speed; // Adjust the speed of the pipes here

    // give 1 point & create new pipe
    if (pipe.x <= -knifeAndFork.width) {
      currentScore++;
      // remove & create new pipe
      pipes = [...pipes.slice(1), knifeAndFork.newPipe()];
    }

    if (pipe.collideWithCabbage()) {
      hasCollided = true;
    }
  });

  // Render
  ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  cabbage.draw();

  pipes.forEach((pipe) => {
    pipe.draw();
  });

  // Display score
  renderScore();
  if (
    hasCollided ||
    cabbage.y > canvas.offsetHeight - cabbage.height ||
    cabbage.y + cabbage.height < 0
  ) {
    looseBanquet();
    return;
  }

  // Request next frame
  requestAnimationFrame(banquetLoop);
}

function looseBanquet() {
  document.body.scrollIntoView({ behavior: "smooth" });
  if (currentScore > highScore) {
    highScore = currentScore;
  }
  document.querySelector("#banquetpopup .highscore").innerText = highScore;
  postScore("banquet", currentScore, localStorage.getItem("medievalName")).then(
    (res) => {
      const scores = res.highscores;
      document.querySelector("#banquetpopup #highscores").innerHTML = "";
      scores
        .sort((a, b) => b.score - a.score)
        .forEach((score) => {
          const li = document.createElement("li");
          li.innerHTML = `${score.gueuxName} - ${score.gueuTeam} : <mark>${score.score}</mark>`;
          document.querySelector("#banquetpopup #highscores").appendChild(li);
        });
    }
  );
  document.getElementById("banquetpopup").style.display = "flex";
}

function cabbageJump(event) {
  cabbage.jump();
}

function unloadBanquet() {
  if (isMobile()) {
    document.removeEventListener("touchstart", cabbageJump);
  } else {
    document.removeEventListener("mousedown", cabbageJump);
  }
}

class Pipe {
  constructor(x, gap) {
    this.x = x;
    this.gap = gap;
  }

  getRects() {
    const { forkHeight, knifeHeight } = knifeAndFork.heights();
    var topY = this.gap - knifeAndFork.gap / 2 - forkHeight;
    var forkTotalheight = forkHeight;
    if (topY > 0) {
      topY = 0;
      forkTotalheight = this.gap - knifeAndFork.gap / 2;
    }

    var knifeTotalHeight = knifeHeight;
    if (this.gap + knifeAndFork.gap / 2 + knifeHeight < canvas.height) {
      knifeTotalHeight = canvas.height - (this.gap + knifeAndFork.gap / 2);
    }

    return [
      {
        x: this.x,
        y: topY,
        width: knifeAndFork.width,
        height: forkTotalheight,
      },
      {
        x: this.x,
        y: this.gap + knifeAndFork.gap / 2,
        width: knifeAndFork.width,
        height: knifeTotalHeight,
      },
    ];
  }

  collideWithCabbage() {
    const [top, bottom] = this.getRects();
    return (
      (cabbage.x < top.x + top.width &&
        cabbage.x + cabbage.width > top.x &&
        cabbage.y < top.y + top.height &&
        cabbage.y + cabbage.height > top.y) ||
      (cabbage.x < bottom.x + bottom.width &&
        cabbage.x + cabbage.width > bottom.x &&
        cabbage.y < bottom.y + bottom.height &&
        cabbage.y + cabbage.height > bottom.y)
    );
  }

  draw(debug = false) {
    const [top, bottom] = this.getRects();
    ctx.drawImage(knifeAndFork.forkImage, top.x, top.y, top.width, top.height);
    ctx.drawImage(
      knifeAndFork.knifeImage,
      bottom.x,
      bottom.y,
      bottom.width,
      bottom.height
    );
    if (debug) {
      ctx.strokeStyle = "red";
      ctx.strokeRect(top.x, top.y, top.width, top.height);
      ctx.strokeRect(bottom.x, bottom.y, bottom.width, bottom.height);
    }
  }
}

function renderScore() {
  ctx.textAlign = "center";
  ctx.fillStyle = "darkgoldenrod";
  ctx.font = "64px MedievalSharp";
  ctx.fillText(currentScore, canvas.offsetWidth / 2, 100);
}

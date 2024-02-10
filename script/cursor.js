const width = 30;
const height = 52;
const fps = 30;
let hoverInterval = null; // Interval des particules quand element hover.
let hoverAnimation = {
  running: false,
  currentPosition: {
    x: 0,
    y: 0,
  },
};

const createParticleCursor = (x, y, size, rotation, duration) => {
  const cursor = particlePool.getNewParticle(duration);
  cursor.style.width = Math.floor(width * size) + "px";
  cursor.style.height = Math.floor(height * size) + "px";
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
  cursor.style.rotate = `${rotation}rad`;
  cursor.style.opacity = 1;
  return cursor;
};

function mousePosition(e) {
  return {
    x: e.pageX,
    y: e.pageY,
  };
}

document.addEventListener("DOMContentLoaded", function () {
  const mainCursor = document.getElementById("main-cursor");
  initIdleCursorAnimation();
  activateBurstOnClick();

  document.addEventListener("mousemove", function (e) {
    const { x, y } = mousePosition(e);
    mainCursor.style.left = x + "px";
    mainCursor.style.top = y + "px";
    hoverAnimation.currentPosition = { x, y };
    // console.log({ sx: e.pageX, sy: e.pageY });
  });

  if (isMobile()) {
    mainCursor.style.display = "none";
    console.log("Cursor particle deactivated on mobile");
    return;
  }

  /*document.addEventListener("click", function (e) {
    burst(50);
  });*/

  const interactiveElements = document.querySelectorAll(
    "button, a, false-link"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("mousemove", function (e) {
      hoverAnimation.running = true;
    });
    element.addEventListener("mouseleave", function (e) {
      hoverAnimation.running = false;
    });
    element.addEventListener("click", function (e) {
      hoverAnimation.running = false;
    });
  });
});

function activateBurstOnClick() {
  document.addEventListener("click", burst, true);
}
function disableBurstOnClick() {
  document.removeEventListener("click", burst, true);
}

function spawnParticle(x, y, options) {
  let speed = options
    ? options.speed || floorRandomBetween(2, 10)
    : floorRandomBetween(2, 10);
  let duration = options
    ? options.duration || floorRandomBetween(500, 1500)
    : floorRandomBetween(500, 1500);
  let size = options ? options.size : undefined;
  let direction = options
    ? options.direction || { x: randomBetween(0, 1), y: randomBetween(0, 1) }
    : { x: randomBetween(0, 1), y: randomBetween(0, 1) };
  let rotation = options
    ? options.rotation !== undefined
      ? options.rotation
      : randomBetween(0, Math.PI * 2)
    : randomBetween(0, Math.PI * 2);

  let follow = particlePool.pool.length === 0;
  const particle = createParticleCursor(x, y, size, rotation, duration);
  particle.direction = direction;
  particle.speed = speed;
  particle.duration = duration;
  particle.follow = follow;

  return particle;
}

function burst(nbParticle = 50) {
  // console.log("burst");
  const { width, height } = document
    .getElementById("main-cursor")
    .getBoundingClientRect();

  const { x: mouseX, y: mouseY } = hoverAnimation.currentPosition;

  let particles = [];
  if (isNaN(nbParticle)) nbParticle = 50;
  for (let i = 0; i < nbParticle; i++) {
    const randomX = randomBetween(-1, 1);
    const randomY = randomBetween(-1, 1);

    const x = mouseX - width / 2 + Math.floor(randomX * width * 0.2);
    const y = mouseY - height / 2 + Math.floor(randomY * height * 0.2);

    const ratio = Math.random();
    const size = ratio * 1.5;
    const speed = Math.floor(10 / ratio);
    const duration = Math.floor(800 + ratio * 800);
    particles.push(
      spawnParticle(x, y, {
        direction: { x: randomX, y: randomY },
        size,
        speed,
        duration,
        rotation: randomBetween(0, Math.PI * 2),
      })
    );
  }
}

function initIdleCursorAnimation() {
  hoverInterval = setInterval(() => {
    // monitorParticles();

    // Move particles
    particlePool.getRunningParticles().forEach((p) => {
      const { particle } = p;
      const { width, height } = document.body.getBoundingClientRect();
      const top = parseInt(particle.style.top.slice(0, -2));
      const left = parseInt(particle.style.left.slice(0, -2));

      if (top < 0 || top > height || left < 0 || left > width) {
        p.state = "ended";
        particle.style.display = "none";
        return;
      }

      const addedX = Math.round(particle.direction.x * particle.speed);
      const addedY = Math.round(particle.direction.y * particle.speed);
      particle.style.top = top + addedX + "px";
      particle.style.left = left + addedY + "px";
      particle.style.opacity =
        parseFloat(particle.style.opacity) - fps / particle.duration;
    });

    document.getElementById("main-cursor").style.opacity = 1;
    if (!hoverAnimation.running) return;
    document.getElementById("main-cursor").style.opacity = 0;
    burst(2);
  }, 1000 / fps);
}

const particlePool = {
  pool: [],
  getRunningParticles: function () {
    return this.pool.filter((p) => p.state === "running");
  },
  getNewParticle: function (duration) {
    const freeParticle = this.pool.find((p) => p.state === "ended");
    let targetParticle;

    if (freeParticle) {
      freeParticle.state = "running";
      freeParticle.particle.style.display = "block";
      targetParticle = freeParticle;
    } else {
      const element = document.createElement("span");
      element.classList.add("custom-cursor");
      element.classList.add("cursor-particle");
      document.body.appendChild(element);
      const poolParticle = {
        particle: element,
        state: "running",
        follow: this.pool.length === 0,
      };
      this.pool.push(poolParticle);
      targetParticle = poolParticle;
    }

    setTimeout(() => {
      targetParticle.particle.style.display = "none";
      targetParticle.state = "ended";
    }, duration);
    return targetParticle.particle;
  },
  extinguishParticles: function () {
    this.getRunningParticles().map((p) => {
      p.state = "ended";
      p.particle.remove();
    });
    disableBurstOnClick();
  },
};

function resetCursor() {
  setNewCursor("gif/fireanim.gif");
  activateBurstOnClick();
}

function setNewCursor(newImg, showCursor = false) {
  const mainCursor = document.getElementById("main-cursor");
  mainCursor.style.backgroundImage = `url('../static/${newImg}')`;
}

function animateSword() {
  const mainCursor = document.getElementById("main-cursor");
  mainCursor.style.display = "block";
  mainCursor.style.backgroundImage = 'url("../static/gif/sword/sword13.gif")';
  setTimeout(() => {
    if (isMobile()) mainCursor.style.display = "none";
    mainCursor.style.backgroundImage = 'url("../static/gif/sword/sword13.png")';
  }, 2500);
}

function monitorParticles() {
  console.log(
    `Particle running ${particlePool.getRunningParticles().length}/${
      particlePool.pool.length
    }`
  );
}

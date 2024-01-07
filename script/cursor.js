const width = 30;
const height = 52;

const createParticleCursor = (x, y) => {
  const cursor = document.createElement("span");
  cursor.classList.add("custom-cursor");
  cursor.classList.add("cursor-particle");
  document.body.appendChild(cursor);

  const randomSize = randomBetween(0.1, 0.8);

  cursor.style.width = Math.floor(width * randomSize) + "px";
  cursor.style.height = Math.floor(height * randomSize) + "px";
  cursor.style.left = x + "px";
  cursor.style.top = y + "px";
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

  document.addEventListener("mousemove", function (e) {
    const { x, y } = mousePosition(e);
    mainCursor.style.left = x + "px";
    mainCursor.style.top = y + "px";
    // console.log({ sx: e.pageX, sy: e.pageY });
  });

  document.addEventListener("click", function (e) {
    const particleNb = 60;
    const { x, y } = mousePosition(e);
    console.log({ x, y });

    const particles = [];

    for (let i = 0; i < particleNb; i++) {
      particles.push(spawnParticle(x, y));
    }

    setTimeout(() => {
      particles.forEach((particle) => {
        // particle.remove();
        particle.particle.style.transform = particle.transform;
        particle.particle.style.opacity = 0;
      });
      setTimeout(() => {
        particles.forEach((particle) => {
          particle.particle.remove();
        });
      }, 1500);
    }, 1);
  });
});

function spawnParticle(x, y) {
  const maxDirection = 2;
  const directionX = floorRandomBetween(maxDirection * -1, maxDirection);
  const directionY = floorRandomBetween(maxDirection * -1, maxDirection);
  const particle = createParticleCursor(x + directionX, y + directionY);

  const speed = floorRandomBetween(2, 25);

  const duration = floorRandomBetween(500, 1500);

  particle.style.transition = "all " + duration + "ms";

  return {
    particle,
    transform: `translate(${directionX * speed}px, ${directionY * speed}px)`,
  };
}

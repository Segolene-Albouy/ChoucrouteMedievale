const teams = {
  kraken: {
    color: "",
    title: "Le clan du Kraken",
  },
  ours: {
    color: "",
    title: "La faction de l'Ours",
  },
  cerf: {
    color: "",
    title: "Le fief du Cerf",
  },
  dragon: {
    color: "",
    title: "Le coterie du Dragon",
  },
  corbeau: {
    color: "",
    title: "La confrerie du Corbeau",
  },
};

const teamNames = Object.keys(teams);
var team, teamName, covered, timer, newText;

function randomTeam() {
  return teamNames[Math.floor(Math.random() * teamNames.length)];
}

function hideTeam() {
  document.getElementById("team").style.opacity = 0;
  setTimeout(() => {
    document.getElementById("team").style.display = "none";
  }, 2000);
}

function drawTeam() {
  team = localStorage.getItem("medievalTeam") ?? randomTeam();
  const drawDiv = document.getElementById("draw-team");

  drawDiv.classList.add("submitted");
  setTimeout(() => {
    drawDiv.style.display = "none";
    const teamReveal = document.getElementById("team-reveal");
    teamReveal.style.display = "flex";
    teamReveal.classList.add("bornInFlames");
    teamName = teams[team].title;
    covered = teamName.replace(/[^\s]/g, "_");
    document.getElementById("team-name").innerHTML = covered;
    timer = setInterval(decode, 50);
  }, 3);
}

function decode() {
  newText = covered.split("").map(changeLetter()).join("");
  document.getElementById("team-name").innerHTML = newText;
  if (teamName === covered) {
    clearInterval(timer);
    document.querySelector("#team-reveal button").removeAttribute("disabled");
    teamReveal();
    return false;
  }
  covered = newText;
}

function changeLetter() {
  const replacements = "DLCOKabcdefghiklmnopqrstuvwxyz'";
  return function (letter, index, err) {
    return teamName[index] === letter
      ? letter
      : replacements[Math.floor(Math.random() * replacements.length)];
  };
}

function teamReveal() {
  const explosionGif = document.getElementById("explosion");
  const teamGif = document.getElementById(team);

  explosionGif.style.display = "block";

  setTimeout(() => {
    explosionGif.style.display = "none";
  }, 750);
  setTimeout(() => {
    teamGif.style.display = "block";
    teamGif.classList.add("bornInFlames");
  }, 250);
}

const selectTeamSteps = [];
let currentSelectTeamStep = 0;

document.addEventListener("DOMContentLoaded", function () {
  // Init unecessary steps

  document.querySelectorAll("[role=unecessary-steps]").forEach((elt) => {
    const btn = elt.querySelector("button");
    if (!btn.hasAttribute("onClick")) {
      btn.addEventListener("click", () => nextUnecessaryStep());
    }
    selectTeamSteps.push(elt);
  });
});

function nextUnecessaryStep() {
  const current = selectTeamSteps[currentSelectTeamStep];
  current.style.opacity = 0;
  currentSelectTeamStep++;
  const next = selectTeamSteps[currentSelectTeamStep];

  setTimeout(() => {
    current.style.display = "none";
  }, 2000);

  if (currentSelectTeamStep >= selectTeamSteps.length) return;

  next.style.display = "block";
  setTimeout(() => {
    next.style.opacity = 1;
  }, 1750);
}

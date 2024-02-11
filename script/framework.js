const pages = {};
let currentOpenPage = null;
let currentPageId = "cour";

const loadHome = (firstTime) => {
  resetCursor();
  if (!firstTime) play("tavern");
};
const unloadHome = () => {};

const loadBanquet = () => {
  resetCursor();
};
const unloadBanquet = () => {};
const loadArmurerie = () => {
  /*resetCursor();*/
  particlePool.extinguishParticles();
  setNewCursor("gif/wand.gif");
};
const unloadArmurerie = () => {
  resetCursor();
};

const loadDungeon = () => {
  particlePool.extinguishParticles();
  setNewCursor("gif/sword/sword13.png");
  document.addEventListener("click", animateSword, true);
  play("fire");

  const ascii = document.getElementById("sexy");
  if (ascii.innerHTML !== "") return;

  fetch("static/chevalier-sexy.txt")
    .then((response) => response.text())
    .then((sexyAscii) => {
      let index = 0;

      const sexyInterval = setInterval(() => {
        const char = sexyAscii[index];
        if (char === " ") {
          // Next not space index
          let nextIndex = index;
          while (sexyAscii[nextIndex] === " " && nextIndex < sexyAscii.length) {
            nextIndex++;
          }
          // add characters between indexes
          ascii.innerHTML += sexyAscii.slice(index, nextIndex);
          index = nextIndex;
        } else {
          ascii.innerHTML += char;
          index++;
        }
        if (index >= sexyAscii.length) {
          clearInterval(sexyInterval);
          return;
        }
      }, 1);
    })
    .catch((error) => console.error("Error loading ASCII content:", error));
};

const unloadDungeon = () => {
  document.removeEventListener("click", animateSword, true);
  activateBurstOnClick();
};

const pagesOnload = {
  cour: loadHome,
  donjon: loadDungeon,
  banquet: loadBanquet,
  armurerie: loadArmurerie,
  forum: loadForum,
};

const pagesOnUnload = {
  cour: unloadHome,
  donjon: unloadDungeon,
  banquet: unloadBanquet,
  armurerie: unloadArmurerie,
  forum: unloadForum,
};

function opendor() {
  const landiv = document.getElementById("main-landing");
  const openDor = document.getElementById("opendor");

  document.getElementsByTagName("main")[0].style.display = "block";
  play("slide", () => play("tavern"));

  pages[currentPageId].show(true);

  openDor.classList.add("fade");
  setTimeout(() => {
    landiv.classList.add("loading"); // Pour prendre en compte le délai de lancement de l'audio
  }, 200);
  setTimeout(() => {
    // Animation end
    openDor.remove();
    landiv.classList.add("loaded");
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  const pagesIds = Object.keys(pagesOnload);
  document.querySelectorAll(".page").forEach((page) => {
    if (!page.id) {
      throw new Error("Les .page doivent avoir un id");
    } else if (!pagesIds.includes(page.id)) {
      throw new Error(`#${page.id} n'a pas de fonction pour l'instancier`);
    }
    pages[page.id] = new Page(page.id);
  });

  const initialPage = window.location.href.split("/").pop().replace("#", "");
  if (pages[initialPage]) {
    currentPageId = initialPage;
  }

  // Hide all pages
  document.querySelectorAll(".page").forEach((page, i) => {
    pages[page.id].hide();
  });

  /*// Create collapsible
  document
    .querySelectorAll("[role=collapse-trigger]")
    .forEach((collapsible) => {
      collapsible.addEventListener("click", function () {
        // Pourquoi t'as pas juste fait un toggle de display none?
        this.classList.toggle("collapsed");
      });
    });*/

  document
    .querySelectorAll(".collapsible")
    .forEach((collapsible) => {
      const trigger = collapsible.querySelector("[role=collapse-trigger]");
      const content = collapsible.querySelector("[role=collapse-content]");

      trigger.addEventListener("click", function () {
        // Toggle the "collapsed" class on the trigger
        this.classList.toggle("collapsed");

        // Toggle the "expanded" class on the content
        if (content) {
          content.classList.toggle("msg-box");
        }
      });
    });

  // create doors
  createDoorsNavigation();
});

// Cause un bug sur Chrome qui fait que event.state est toujours null
// window.addEventListener("popstate", function (event) {
//   // show previous page if user click on "Back to page"
//   const pageId = event.state ? event.state.page : "cour";
//   if (pages[event.state.page]) {
//     pages[pageId].show();
//   }
// });

class Page {
  constructor(id) {
    this.id = id;
    this.onload = pagesOnload[this.id];
    this.onunload = pagesOnUnload[this.id];
  }
  // permet de passer des arguments de n'importe où et de n'importe quel type
  // (cf opendor pages[currentPageId].show({firstTime:true}); pour fix le bug du son tavern qui se répète)
  show(props) {
    // TODO close and open walls + sounds of footsteps with reverb
    if (currentOpenPage === this) return;
    if (currentOpenPage) {
      currentOpenPage.onunload();
      currentOpenPage.hide();
    }
    currentOpenPage = this;
    document.getElementById(this.id).classList.remove("hidden");
    this.onload(props);

    history.pushState(
      { page: this.id },
      null,
      this.id === "cour" ? "/" : `/#${this.id}`
    );
  }
  hide() {
    document.getElementById(this.id).classList.add("hidden");
  }
}

function logDoors() {
  document.querySelectorAll('input[name="doors"]').forEach((input) => {
    console.log(input.id, input.checked);
  });
}

function createDoorsNavigation() {
  // Create input radio for each page
  const pagesIds = Object.keys(pagesOnload);
  const doors = document.getElementById("doors");
  pagesIds.forEach((pageId) => {
    const input = document.createElement("input");
    input.setAttribute("type", "radio");
    input.setAttribute("name", "doors");
    input.setAttribute("id", pageId + "door");
    // Create label including link
    // const label = document.createElement("label");
    // label.setAttribute("for", pageId);
    const door = document.createElement("a");
    door.setAttribute("href", `#${pageId}`); // Make anchor link
    door.classList.add("door");
    door.classList.add("door");
    door.innerText = pageId.capitalize();

    door.addEventListener("click", function (e) {
      // Scroll body to top of page
      pages[pageId].show(); // Show page
      input.checked = true;
      // Check input (will change CSS)
      (function smoothscroll() {
        var currentScroll =
          document.documentElement.scrollTop || document.body.scrollTop;
        if (currentScroll > 0) {
          window.requestAnimationFrame(smoothscroll);
          window.scrollTo(0, currentScroll - currentScroll / 5);
        }
      })();
    });

    // Set selected if currentPageId is this pageId
    if (currentPageId === pageId) {
      input.checked = true;
    }

    // Add to DOM
    // label.appendChild(door);
    doors.appendChild(input);
    doors.appendChild(door);
  });
}

function bypassLanding() {
  const landiv = document.getElementById("main-landing");
  landiv.style.display = "none";
  localStorage.setItem("medievalName", "Clément L’Ancien");
  localStorage.setItem("medievalPsw", "dev_psw");
  opendor();
}

// onDismiss should return true/false if the popup should be dismissed on click
function errorPopup(message, onDismiss) {
  displayPopup("error", message, onDismiss);
}

// onDismiss should return true/false if the popup should be dismissed on click
function warningPopup(message, onDismiss) {
  displayPopup("warning", message, onDismiss);
}

// To call from errorPopup or warningPopup
function displayPopup(popupRole, message, onDismiss) {
  document.querySelectorAll(".popup").forEach((e) => {
    e.replaceWith(e.cloneNode(true)); // Will clear all event listeners/styles etc..
  });
  const popup = document.querySelector(`.popup[role=${popupRole}]`);
  popup.querySelector(".message").innerText = message;
  popup.style.display = "flex";
  document.body.setAttribute("state", "locked");

  popup.addEventListener("click", () => {
    let dismissPopup = onDismiss ? onDismiss() : true; // dismiss popup by default
    if (dismissPopup) {
      popup.style.display = "none";
      document.body.removeAttribute("state");
    }
  });
  popup.scrollIntoView();
}

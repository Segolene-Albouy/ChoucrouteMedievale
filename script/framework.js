const pages = {};
let currentOpenPage = null;
let currentPageId = "cour";

const loadHome = () => {
    setTimeout(() => {
        play("tavern");
    }, 2500);
};
const loadBanquet = () => {};
const loadArmurerie = () => {};

const loadDungeon = () => {
    particlePool.extinguishParticles();
    play("fire");
    const ascii = document.getElementById('sexy');
    const charWidth = 226;

    ascii.style.fontSize = `${ascii.offsetWidth / (charWidth * 0.67)}px`; // 0.67 to compensate that font is higher than wide

    fetch('static/chevalier-sexy.txt')
        .then(response => response.text())
        .then(sexyAscii => {
            let index = 0;

            function typeChar() {
                const char = sexyAscii[index];
                ascii.innerHTML += char;
                index++;

                if (index < sexyAscii.length) {
                    setTimeout(() => {
                        typeChar();
                    }, char === " " ? 0 : 5);
                }
            }
            typeChar();
        })
        .catch(error => console.error('Error loading ASCII content:', error));
};

const pagesCallbacks = {
    cour: loadHome,
    donjon: loadDungeon,
    banquet: loadBanquet,
    armurerie: loadArmurerie
}

function opendor() {
    const landiv = document.getElementById("landing");
    const openDor = document.getElementById("opendor");

    landiv.classList.add("loading");

    document.getElementsByTagName("main")[0].style.display = "block";
    play("slide");

    pages[currentPageId].show();

    openDor.classList.add("fade");
    setTimeout(() => { // Animation end
        openDor.remove();
        landiv.classList.add("loaded");
    }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
    const pagesIds = Object.keys(pagesCallbacks);
    document.querySelectorAll(".page").forEach((page, ) => {
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
});

window.addEventListener("popstate", function (event) {
    // show previous page if user click on "Back to page"
    const pageId = event.state ? event.state.page : "cour";
    if (pages[pageId]) {
        pages[pageId].show();
    }
});

class Page {
    constructor(id) {
        this.id = id;
        this.callback = pagesCallbacks[this.id]
        //this.path = this.id === "cour" ? "" : `${this.id}`;
    }
    show() {
        // TODO close and open walls + sounds of footsteps with reverb
        if (currentOpenPage === this) return;
        if (currentOpenPage) currentOpenPage.hide();
        currentOpenPage = this;
        document.getElementById(this.id).classList.remove("hidden");
        this.callback();

        history.pushState({ page: this.id }, null, this.id === "cour" ? "/" : `/#${this.id}`);
        this.createDoors()
    }
    hide() {
        document.getElementById(this.id).classList.add("hidden");
    }

    createDoors(){
        const doors = document.getElementById("doors");
        doors.innerHTML = "";

        const pagesIds = Object.keys(pagesCallbacks).filter(id => id !== this.id);
        pagesIds.map(pageId => {
            // const link = pageId === "cour" ?
            const door = document.createElement("a");
            door.setAttribute("href", pageId);
            door.classList.add("door");
            door.innerHTML += `<img src="static/closedor.gif" alt="${pageId} Door" />
                               <span>${pageId.capitalize()}</span>`;

            door.addEventListener("click", function (e) {
                e.preventDefault();
                console.log(e);
                console.log({ pageId });
                pages[pageId].show();
            });
            doors.appendChild(door);
        });
    }
}

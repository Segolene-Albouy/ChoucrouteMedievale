const pages = {};
let currentOpenPage = null;
let currentPageId = "home";


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
    // Compute pages
    document.querySelectorAll(".page").forEach((page, i) => {
        if (!page.id) {
            throw new Error("Les .page doivent avoir un id");
        } else if (pages[page.id]) {
            throw new Error(
                `Les .page doivent avoir un id unique. #${page.id} a déjà été attribué`
            );
        }
        pages[page.id] = new Page(page.id);
    });

    const initialPage = window.location.href.split("/").pop().replace("#", "");
    if (pages[initialPage]) {
        currentPageId = initialPage;
    }

    // Compute links
    document.querySelectorAll("a").forEach((link) => {
        const pageId = link.getAttribute("href");
        if (!pages[pageId]) {
            throw new Error(
                `Les liens doivent pointer vers une .page existante. ${link.href} n'existe pas`
            );
        }
        // Add click event
        link.addEventListener("click", function (e) {
            e.preventDefault();
            console.log(e);
            console.log({ pageId });
            pages[pageId].show();
        });
    });

    // Hide all pages
    document.querySelectorAll(".page").forEach((page, i) => {
        pages[page.id].hide();
    });
});

window.addEventListener("popstate", function (event) {
    // show previous page if user click on "Back to page"
    const pageId = event.state ? event.state.page : "home";
    if (pages[pageId]) {
        pages[pageId].show();
    }
});

const loadHome = () => {
    setTimeout(() => {
        play("tavern");
    }, 2500);
};
const loadCharacters = () => {};
const loadTricks = () => {};

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


const callbacks = {
    home: loadHome,
    donjon: loadDungeon,
    perso: loadCharacters,
    astuces: loadTricks
}

class Page {
    constructor(id) {
        this.id = id;
        this.callback = callbacks[this.id]
        //this.path = this.id === "home" ? "" : `${this.id}`;
    }
    show() {
        // TODO close and open walls + sounds of footsteps with reverb
        if (currentOpenPage === this) return;
        if (currentOpenPage) currentOpenPage.hide();
        currentOpenPage = this;
        document.getElementById(this.id).classList.remove("hidden");
        this.callback();

        history.pushState({ page: this.id }, null, this.id === "home" ? "/" : `/#${this.id}`);
    }
    hide() {
        document.getElementById(this.id).classList.add("hidden");
    }
}

const pages = {};
let currentOpenPage = undefined;

function opendor() {
    document.getElementById("landing").classList.add("loading");
    document.getElementsByTagName("main")[0].style.display = "block";
    play("slide");
    pages.home.show();
    document.getElementById("opendor").classList.add("fade");
    setTimeout(() => {
        play("tavern");
    }, 2500);

    setTimeout(() => {// Animation end
        document.getElementById("opendor").remove();
        document.getElementById("landing").classList.add("loaded");
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

    // Compute links
    document.querySelectorAll("a").forEach((link) => {
        if (!pages[link.getAttribute("href")]) {
            throw new Error(
                `Les liens doivent pointer vers une .page existante. ${link.href} n'existe pas`
            );
        }
        // Add click event
        link.addEventListener("click", function (e) {
            e.preventDefault();
            console.log(e);
            const targetPageId = e.target.closest("a").getAttribute("href");
            console.log({ targetPageId });
            pages[targetPageId].show();
        });
    });

    // Hide all pages
    document.querySelectorAll(".page").forEach((page, i) => {
        pages[page.id].hide();
    });
});

const loadHome = () => {
    // TODO move opendor code here
};
const loadCharacters = () => {};
const loadTricks = () => {};

const loadDungeon = () => {
    particlePool.extinguishParticles();
    play("fire");
    const ascii = document.getElementById('sexy');
    const [, width] = getHeightWidth("sexy");
    const charWidth = 226;

    ascii.style.fontSize = `${width / (charWidth * 0.67)}px`; // 0.67 to compensate that font is higher than wide

    fetch('static/chevalier-sexy.txt')
        .then(response => response.text())
        .then(sexyAscii => {
            let index = 0;
            // TODO make it responsive

            function typeChar() {
                const char = sexyAscii[index];
                ascii.innerHTML += char;
                index++;

                if (index < sexyAscii.length) {
                    setTimeout(() => {
                        typeChar();
                    }, char === " " ? 1 : 5);
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
        this.callback = callbacks[id]
    }
    show() {
        // TODO close and open walls + sounds of footsteps with reverb
        if (currentOpenPage === this) return;
        if (currentOpenPage) currentOpenPage.hide();
        currentOpenPage = this;
        document.getElementById(this.id).classList.remove("hidden");
        this.callback();
    }
    hide() {
        document.getElementById(this.id).classList.add("hidden");
    }
}

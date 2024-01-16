const pages = {};
var currentOpenPage = undefined;

document.addEventListener("DOMContentLoaded", function () {
  // Compute pages
  document.querySelectorAll(".page").forEach((page, i) => {
    if (!page.id) {
      throw new Error("Les .page doivent avoir un id");
    } else if (pages[page.id]) {
      throw new Error(
        "Les .page doivent avoir un id unique. #" +
          page.id +
          " existe autre part"
      );
    }
    pages[page.id] = new Page(page.id);
  });

  // Compute links
  document.querySelectorAll("a").forEach((link) => {
    if (!pages[link.getAttribute("href")]) {
      throw new Error(
        "Les liens doivent pointer vers une .page existante " +
          link.href +
          " n'existe pas"
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

class Page {
  constructor(id) {
    this.id = id;
  }
  show() {
    if (currentOpenPage == this) return;
    if (currentOpenPage) currentOpenPage.hide();
    currentOpenPage = this;
    document.getElementById(this.id).classList.remove("hidden");
  }
  hide() {
    document.getElementById(this.id).classList.add("hidden");
  }
}

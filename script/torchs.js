document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll(".torch").forEach((torch) => {
    torch.addEventListener("click", function (e) {
      const target = e.target.closest(".torch");
      target.classList.toggle("on");
    });
    torch.addEventListener("mouseenter", function (e) {
      document.getElementById("main-cursor").classList.add("amplify");
    });
    torch.addEventListener("mouseleave", function (e) {
      document.getElementById("main-cursor").classList.remove("amplify");
    });
  });
});

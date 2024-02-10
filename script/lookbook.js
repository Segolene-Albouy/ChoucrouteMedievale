document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll(".drag img");
    images.forEach(dragElement);

    let maxZIndex = 1

    function dragElement(img) {
        let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

        img.onmousedown = dragMouseDown;

        function dragMouseDown(e) {
            maxZIndex++;
            e = e || window.event;
            e.preventDefault();
            pos3 = e.clientX;
            pos4 = e.clientY;
            // originalZIndex = img.style.zIndex || 1; // Store the original z-index
            img.style.zIndex = maxZIndex;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;
            img.style.top = (img.offsetTop - pos2) + "px";
            img.style.left = (img.offsetLeft - pos1) + "px";
        }

        function closeDragElement() {
            // img.style.zIndex = originalZIndex;
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
});

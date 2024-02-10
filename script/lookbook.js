function getTopOffset(type){
    const typeOffset = {
        "couvre-chef": -400,
        "affublement": 0,
        "godille": 400
    }
    return randomBetween(typeOffset[type] - 50, typeOffset[type] + 50);
}

window.onload = function () {
    const guenilles = document.querySelectorAll(".drag img");
    const lookbook = document.getElementById('lookbook').getBoundingClientRect();

    guenilles.forEach(dragElement);

    let maxZIndex = 1

    function dragElement(guenille) {
        let xOffset = 0, yOffset = 0, x = 0, y = 0;

        guenille.onmousedown = dragMouseDown;
        initialPosition(guenille);

        function initialPosition() {
            const guenilleBox = guenille.getBoundingClientRect();

            x = lookbook.left + (lookbook.width - guenilleBox.width) / 2;
            y = lookbook.top + (lookbook.height - guenilleBox.height) / 2;
            xOffset = x - guenilleBox.left;
            yOffset = y - guenilleBox.top;

            const top = guenille.offsetTop + yOffset;
            const left = guenille.offsetLeft + xOffset

            guenille.style.top = (top + getTopOffset(guenille.parentElement.parentElement.id)) + "px";
            guenille.style.left = (left + randomBetween(-500, 500)) + "px";
        }

        function dragMouseDown(e) {
            maxZIndex++;
            e = e || window.event;
            e.preventDefault();
            x = e.clientX;
            y = e.clientY;
            guenille.style.zIndex = maxZIndex;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            xOffset = x - e.clientX;
            yOffset = y - e.clientY;
            x = e.clientX;
            y = e.clientY;
            guenille.style.top = (guenille.offsetTop - yOffset) + "px";
            guenille.style.left = (guenille.offsetLeft - xOffset) + "px";
        }

        function closeDragElement() {
            // img.style.zIndex = originalZIndex;
            document.onmouseup = null;
            document.onmousemove = null;
        }
    }
}

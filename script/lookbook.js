function getTopOffset(type){
    const typeOffset = {
        "couvre-chef": -400,
        "affublement": 0,
        "godille": 400
    }
    return randomBetween(typeOffset[type] - 50, typeOffset[type] + 50);
}

const isPhone = isMobile();

function getCursorXY(e){
    const cursor = isPhone ? e.touches[0] : e;
    return [cursor.clientX, cursor.clientY];
}

window.onload = function () {
    const guenilles = document.querySelectorAll(".drag img");
    const lookbook = document.getElementById('lookbook').getBoundingClientRect();

    guenilles.forEach(dragElement);

    let maxZIndex = 1

    function dragElement(guenille) {
        let xOffset = 0, yOffset = 0, x = 0, y = 0;

        if (isPhone){
            guenille.addEventListener('touchstart', dragMouseDown, { passive: false });
        } else {
            guenille.onmousedown = dragMouseDown;
        }

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
            guenille.style.left = (left + randomBetween(isPhone ? -200 : -500, isPhone ? 200 : 500)) + "px";
        }

        function dragMouseDown(e) {
            maxZIndex++;
            e = e || window.event;
            e.preventDefault();
            [x, y] = getCursorXY(e);
            guenille.style.zIndex = maxZIndex;
            if (isPhone){
                guenille.addEventListener('touchend', closeDragElement);
                guenille.addEventListener('touchmove', elementDrag, { passive: false });
            } else {
                document.onmouseup = closeDragElement;
                document.onmousemove = elementDrag;
            }
        }

        function elementDrag(e) {
            e = e || window.event;
            e.preventDefault();
            xOffset = x - guenille.offsetLeft;
            yOffset = y - guenille.offsetTop;
            [x, y] = getCursorXY(e);

            guenille.style.top = (y - yOffset) + "px";
            guenille.style.left = (x - xOffset) + "px";
        }

        function closeDragElement() {
            if (isPhone){
                guenille.removeEventListener('touchend', closeDragElement);
                guenille.removeEventListener('touchmove', elementDrag);
            } else {
                document.onmouseup = null;
                document.onmousemove = null;
            }
        }
    }
}

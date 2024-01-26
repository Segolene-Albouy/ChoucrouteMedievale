// Create a random between min and max function
function floorRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

// Je sais faut pas faire ça mais je m'en fous
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};


let currentAudio = null;
function play(audioFilename) {
  if (currentAudio) {
    currentAudio.pause();
    // fadeOutAndPause(currentAudio);
  }

  const audio = new Audio(`static/sounds/${audioFilename}.mp3`);
  audio.play();
  currentAudio = audio;

  audio.onended = function () {
    currentAudio = null;
  };
}

function fadeOutAndPause(audio) {
  const initialVolume = audio.volume;
  let currentTime = 0;

  const fadeOutInterval = setInterval(function () {
    currentTime += 50; // ms

    const newVolume = initialVolume - (currentTime / 1500); // 1500 = fade duration

    if (newVolume > 0) {
      audio.volume = newVolume;
    } else {
      audio.volume = 0;
      clearInterval(fadeOutInterval);
      audio.pause();
      audio.currentTime = 0;
    }
  }, 50);
}

function isInViewPort(element) {
  const rect = element.getBoundingClientRect();
  return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getHeightWidth(elementId) {
  const el = document.getElementById(elementId);
  return [el.offsetHeight, el.offsetWidth]
}

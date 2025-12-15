const COMMON_API_URL =
  "https://europe-west9-choucroutemedievale.cloudfunctions.net/";

// Create a random between min and max function
function floorRandomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function shuffleArray(arr) {
  const newArr = [...arr];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Je sais faut pas faire ça mais je m'en fous
// Grosse thug
String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

var currentAudio = null;
function play(audioFilename, onended = () => {}) {
  if (currentAudio) {
    currentAudio.pause();
    // fadeOutAndPause(currentAudio);
  }

  const audio = new Audio(`./ChoucrouteMedievale/static/sounds/${audioFilename}.mp3`);
  audio.play();
  currentAudio = audio;

  audio.onended = function () {
    currentAudio = null;
    onended();
  };
}

function repeatAudio(audioFilename) {
  if (currentAudio) {
    currentAudio.pause();
    // fadeOutAndPause(currentAudio);
  }
  const audio = new Audio(`./ChoucrouteMedievale/static/sounds/${audioFilename}.mp3`);
  audio.loop = true;
  audio.play();
  currentAudio = audio;
  return audio;
}

function playShort(audioFilename) {
  const audio = new Audio(`./ChoucrouteMedievale/static/sounds/${audioFilename}.mp3`);
  audio.play();
}

function fadeOutAndPause(audio) {
  const initialVolume = audio.volume;
  let currentTime = 0;

  const fadeOutInterval = setInterval(function () {
    currentTime += 50; // ms

    const newVolume = initialVolume - currentTime / 1500; // 1500 = fade duration

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
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

function getHeightWidth(elementId) {
  const el = document.getElementById(elementId);
  return [el.offsetHeight, el.offsetWidth];
}

const getJSON = function (url) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.responseType = "json";
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      }
      reject(xhr);
    };
    xhr.send();
  });
};

const postJSON = function (url, data) {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest();
    xhr.open("POST", url, true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.onload = function () {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr.response);
      }
      reject(xhr);
    };
    xhr.send(JSON.stringify(data));
  });
};
/**
 * Example
 * retrieveJSON(url).then(data => {
 *      // do something with data
 *  }).catch(e => {
 *      console.log(e);
 *  });
 * @param url
 * @param {Object|null} data data to post
 * @return {Promise<unknown>}
 */
const retrieveJSON = async (url, data = null) => {
  return (await data) ? postJSON(url, data) : getJSON(url);
};

function isToday(date) {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function formatFullDateTime(date) {
  return isToday(date)
    ? `Aujourd'hui à ${new Intl.DateTimeFormat("fr-FR", {
        timeStyle: "short",
        timeZone: "Europe/Paris",
      }).format(date)}`
    : "le " +
        new Intl.DateTimeFormat("fr-FR", {
          dateStyle: "full",
          timeStyle: "short",
          timeZone: "Europe/Paris",
        }).format(date);
}

function getConnectedUser() {
  return {
    name: localStorage.getItem("medievalName"),
    psw: localStorage.getItem("medievalPsw"),
  };
}

async function mockApiCall(returnedData) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(returnedData);
    }, 2000);
  });
}

function normalizeAngle(angle) {
  return Math.atan2(Math.sin(angle), Math.cos(angle));
}

function postScore(gameName, highscore, gueuxName) {
  return retrieveJSON(COMMON_API_URL + "games", {
    gameName,
    highscore,
    gueuxName,
  }).then((res) => JSON.parse(res));
}

function getDBHighScore(gueuxName) {
  return retrieveJSON(
    COMMON_API_URL + "games?" + new URLSearchParams({ gueuxName })
  );
}

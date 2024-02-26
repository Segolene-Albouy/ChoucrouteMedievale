// var errorMessageElement = null;
var wrongOnce = false;
var APIurl =
  "https://europe-west9-choucroutemedievale.cloudfunctions.net/checkName";
var pswAttempts = 0;
const devMode = false;
let currentDisplayedFormId = null;

function choose(callback) {
  document.getElementById("douves").remove();
  document.getElementById("name-psw").remove();
  callback();
}

function displayError(msg) {
  const errorMessageElement = document.querySelector(
    `${currentDisplayedFormId} div[role=error]`
  );
  console.log(errorMessageElement);

  if (msg) {
    errorMessageElement.querySelector("span").innerHTML = msg;
  }

  if (wrongOnce) {
    // Abusé
    errorMessageElement.classList.add("again");
    setTimeout(() => {
      errorMessageElement.classList.remove("again");
    }, 600);
  }
  wrongOnce = true;
}

function submitName(evt) {
  try {
    commonFormHandler(evt, "name");
  } catch (e) {
    return;
  }

  const name = evt.target.name.value;
  const adj = evt.target.adjectif.value;

  let medievalName = `${name} ${adj}`;
  evt.target.setAttribute("state", "loading");
  apiNewGueux(medievalName);
}

function submitPsw(evt) {
  try {
    commonFormHandler(evt, "psw");
  } catch (e) {
    pswAttempts++;
    if (pswAttempts >= 3) {
      document.getElementById("psw-submit").remove();
      document.getElementById("form-psw").remove();
      document.getElementById("psw-fail").style.display = "block";
    }
    localStorage.setItem("pswAttempts", `${pswAttempts}`);
    return;
  }
  const targetForm = evt.target;
  let medievalPsw = targetForm.psw.value
    .trim()
    .toLowerCase()
    .replace(/\s/g, "-");

  targetForm.setAttribute("state", "loading");
  apiCheckGueux(medievalPsw);
}

function showName() {
  currentDisplayedFormId = "form-name";
  document.getElementById("form-name").style.display = "block";
  document.getElementById("name-input").focus();
  // Build adjectifs options
  const select = document.querySelector("#ask-name select");
  shuffleArray(adjectifs).forEach(([adjectif, fem]) => {
    const option = document.createElement("option");
    option.value = adjectif;
    option.textContent = adjectif;
    select.appendChild(option);
    if (fem) {
      const optionFem = document.createElement("option");
      optionFem.value = fem;
      optionFem.textContent = fem;
      select.appendChild(optionFem);
    }
  });
  select.children[0].selected = true;
}

function showPsw() {
  currentDisplayedFormId = "form-psw";
  document.getElementById("form-psw").style.display = "block";
  document.getElementById("psw-input").focus();
}

function commonFormHandler(evt, keyNeeded) {
  evt.preventDefault();
  if (!evt.target[keyNeeded].value.trim()) {
    // Check key is here
    evt.target.setAttribute("state", "error"); // set form state to error => will trigger css
    throw new Error(`No ${keyNeeded} in form`);
    // TODO displayError avec le again qui se remet
  }
}

function displayTeam(timeout = true) {
  document.getElementById("landing-name").style.zIndex = 11;
  if (timeout) {
    setTimeout(() => {
      document.getElementById("team").style.scale = "1";
    }, 2000);
  } else {
    document.getElementById("team").style.scale = "1";
  }
}

function displayName() {
  document.getElementById("ask-name").style.scale = "1";
  document.getElementById("landing-name").style.zIndex = 10;
}


function openGates(medievalName, submitted = false) {
  // if (devMode) bypassLanding();
  document.getElementById(
    "opendor"
  ).innerHTML += `<mark>${medievalName}</mark>`;

  const landingName = document.getElementById("landing-name");
  const landingTeam = document.getElementById("landing-team");

  if (submitted) {
    // Ajout d'une classe pour faire une transition smooth
    landingName.classList.add("submitted");
    // landingTeam.classList.add("submitted");
    /*setTimeout(() => {
      landingName.remove();
      // landingTeam.remove();
    }, 2000);*/
  } else {
    landingName.remove();
    landingTeam.remove();
  }

  // ici si un ptit filou a ajouté un medievalName + un medievalPsw dans son localStorage, il peut entrer
  // en revanche, il n'aura jamais de clans s'il fait ça 🤨

  // TODO allow "je veux changer de nom"
  // TODO allow "c'est pas moi"
}

document.addEventListener("DOMContentLoaded", function () {
  const medievalName = localStorage.getItem("medievalName");
  const medievalPsw = localStorage.getItem("medievalPsw");
  const medievalTeam = localStorage.getItem("medievalTeam");

  console.log({ medievalName, medievalPsw, medievalTeam });

  // if (devMode) bypassLanding();
  if (devMode) resetLocalStorage();

  if (medievalName && medievalPsw) {
    // API call to update last connection
    const data = { name: medievalName, psw: medievalPsw, team: medievalTeam };
    if (devMode){
      handleResTeam(JSON.stringify(whoIsDev(false)));
    } else {
      retrieveJSON(APIurl, data)
        .then((res) => {
          handleResTeam(res);
        })
        .catch((e) => {
          console.log("Vous êtes un fossoyeur d'identité vilain !", e);
        });
    }
    // openGates(medievalName);
    return;
  }

  // les gardes apparaissent
  displayName();
});

/**
 * ADJECTIFS
 */
const adjectifs = [
  ["Le Pieu", "La Pieuse"],
  ["L’Affreux", "L’Affreuse"],
  ["Le Gentil", "La Gentille"],
  ["Le Bon", "La Bonne"],
  ["Le Maléfique", "La Maléfique"],
  ["L’Habile"],
  ["Le Cruel", "La Cruelle"],
  ["Le Bien Pensant", "La Bien Pensante"],
  ["Le Beau", "La Belle"],
  ["Le Fol Dingo", "La Fol Dingo"],
  ["Le Fainéant", "La Fainéante"],
  ["Le Combattant", "La Combattante"],
  ["Le Valeureux", "La Valeureuse"],
  ["Le Vaillant", "La Vaillante"],
  ["Le Fanfaron", "La Fonfaronne"],
  ["L’Abruti", "L’Abrutie"],
  ["Le Simple", "La Simple"],
  ["Le Juste", "La Juste"],
  ["Le Loyal", "La Loyale"],
  ["L’Aimant", "L’Aimante"],
  ["Le Benet", "La Benet"],
  ["Le Malicieux", "La Malicieuse"],
  ["L’Espiègle"],
  ["Le Cynique", "La Cynique"],
  ["Le Devergoigneux", "La Devergoigneuse"],
  ["L’Optimiste"],
  ["L’Étrange"],
  ["L’Allié", "L’Alliée"],
  ["Le Brave", "La Brave"],
  ["L’Oublié", "L’Oubliée"],
  ["L’Enjoué", "L’Enjouée"],
  ["Le Colérique", "La Colérique"],
  ["L’Opportuniste"],
  ["L’Adorateur", "L’Adoratrice"],
  ["Le Farfelu", "La Farfelue"],
  ["Le Téméraire", "La Téméraire"],
  ["Le Goulu", "La Goulue"],
  ["Le Gourmand", "La Gourmande"],
  ["Le Courageux", "La Courageuse"],
  ["Le Respectable", "La Respectable"],
  ["L’Adorable"],
  ["L’Érudit", "L’Érudite"],
  ["L’Immonde"],
  ["L’Ancien", "L’Ancienne"],
  ["L’Avare"],
  ["Le Malfaisant", "La Malfaisante"],
  ["Le Lâche", "La Lâche"],
  ["Le Couard", "La Couarde"],
  ["Le Vile", "La Vile"],
  ["L’Angélique"],
  ["L’Intrépide"],
  ["L’Audacieux", "L’Audacieuse"],
  ["Le Dangereux", "La Dangereuse"],
];

// Inscription
async function apiNewGueux(name) {
  const targetForm = document.getElementById(currentDisplayedFormId);
  try {
    let res;
    if (devMode) {
      res = whoIsDev(false);
      res = JSON.stringify(res)
    } else {
      res = await retrieveJSON(APIurl, { name });
    }
    if (res) {
      // Success
      res = JSON.parse(res);
      targetForm.removeAttribute("state");
      localStorage.setItem("medievalPsw", res.psw);
      localStorage.setItem("medievalName", res.name);
      localStorage.setItem("medievalTeam", res.team);
      welcomeUser(res.name, res.psw);
    }
  } catch (res) {
    targetForm.setAttribute("state", "error");
    switch (res.status) {
      case 401:
        console.log("Nom de gueux déjà utilisé");
        document.getElementById("name-taken").style.display = "flex";
        break;
      case 500:
        document.getElementById("psw-submit").remove();
        if (res.hasOwnProperty("error")) {
          // Error sur le back
          console.log(res.error);
          displayError("?? Quelle est cette sorcellerie ??");
          document.getElementById("name-submit").remove();
        } else {
          console.log("Nous n'avons plus de mot de passe en réserve");
          // todo handle no more password
        }
    }
  }
}

function handleResTeam(res){
  const currentTeam = localStorage.getItem("medievalTeam");
  res = JSON.parse(res);
  document.getElementById("isComing-input").checked = res.isComing === true;

  localStorage.setItem("medievalPsw", res.psw);
  localStorage.setItem("medievalName", res.name);
  localStorage.setItem("medievalTeam", res.team);
  localStorage.setItem("isComing", res.isComing);

  if (res.team && !currentTeam) {
    displayTeam(false);
  }
  openGates(res.name, true);
}

// Submit Password
async function apiCheckGueux(psw) {
  const targetForm = document.getElementById(currentDisplayedFormId);
  try {
    let res;
    if (devMode) {
      res = whoIsDev(false);
      res = JSON.stringify(res)
    } else {
      res = await retrieveJSON(APIurl, { psw });
    }

    if (res) {
      handleResTeam(res);
      targetForm.removeAttribute("state");
    }
  } catch (res) {
    targetForm.setAttribute("state", "error");
    switch (res.status) {
      case 400:
        console.log("Mauvais mot de passe");
        displayError();
        break;
      case 500:
        document.getElementById("psw-submit").remove();

        if (res.hasOwnProperty("error")) {
          // Error sur le back
          console.log(res.error);
          displayError("?? Essaye tu de nous tromper maraud ??");
        } else {
          // Erreur bdd psw assign to multiple users
          console.log("Cette situation ne devrait point advenir");
          displayError("?? Quelle diablerie avez vous faist ??");
        }
    }
  }
}

function welcomeUser(name, psw) {
  psw = psw.replace("-", " ");
  document.getElementById("form-name").style.display = "none";
  document.getElementById("welcome").style.display = "block";
  document.querySelector("#welcome .thinking").setAttribute("running", "true");

  Array.from(document.querySelectorAll(".username")).forEach((el) => {
    el.innerText = name;
  });
  Array.from(document.querySelectorAll(".password")).forEach((el) => {
    el.innerText = psw;
  });

  setTimeout(() => {
    document
      .querySelectorAll("#welcome >*:not(:first-child)")
      .forEach((e) => (e.style.opacity = "1"));

    document.getElementById("welcome").addEventListener("click", () => {
      displayTeam();
      openGates(name, true);
    });
  }, 3000);
}

function changeComing(evt) {
  const checked = evt.target.checked;

  retrieveJSON(
    "https://europe-west9-choucroutemedievale.cloudfunctions.net/changeAttendance",
    {
      gueuxName: localStorage.getItem("medievalName"),
      isComing: checked,
    }
  )
    .then(() => {
      localStorage.setItem("isComing", checked);
    })
    .catch((err) => {
      displayError(err.message);
      evt.target.checked = !checked;
    });
}

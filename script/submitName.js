// var errorMessageElement = null;
var wrongOnce = false;
var APIurl =
  "https://europe-west9-choucroutemedievale.cloudfunctions.net/checkName";
var pswAttempts = null;
const devMode = false;
let currentDisplayedFormId = null;

function choose(callback) {
  document.getElementById("douves").remove();
  document.getElementById("name-psw").remove();
  callback();
}

function resetLocalStorage() {
  localStorage.removeItem("pswAttempts");
  localStorage.removeItem("medievalPsw");
  localStorage.removeItem("medievalName");
}

function passePartout() {
  localStorage.setItem("medievalName", "Segoline La Devergoigneuse");
  localStorage.setItem("medievalPsw", "prout");
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
  if (devMode) {
    welcomeUser("Prout", "turbo-prout");
    return;
  }
  evt.target.setAttribute("state", "loading");
  apiNewGueux(medievalName);
}

function submitPsw(evt) {
  try {
    commonFormHandler(evt, "psw");
  } catch (e) {
    // Pas de valeur dans le form

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
  if (devMode) {
    openGates("prout", true);
    return;
  }

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

function openGates(medievalName, submitted = false) {
  document.getElementById(
    "opendor"
  ).innerHTML += `<mark>${medievalName}</mark>`;

  if (submitted) {
    // Ajout d'une classe pour faire un transition smooth
    document.getElementById("landing-name").classList.add("submitted");
  } else {
    document.getElementById("landing-name").remove();
  }

  // ici si un ptit filou a ajouté un medievalName + un medievalPsw dans son localStorage, il peut entrer
  // en revanche, il n'aura jamais de clans s'il fait ça 🤨

  // TODO allow "je veux changer de nom"
  // TODO allow "c'est pas moi"
}

document.addEventListener("DOMContentLoaded", function () {
  const medievalName = localStorage.getItem("medievalName");
  const medievalPsw = localStorage.getItem("medievalPsw");

  console.log({ medievalName, medievalPsw });

  if (medievalName && medievalPsw) {
    // ça passe les gardes
    openGates(medievalName);
    if (devMode) return;
    // API call to update last connection
    retrieveJSON(APIurl, { psw: medievalPsw }).then((res) => {
      // res = JSON.parse(res.response);
      console.log(res);
      /*localStorage.setItem("medievalName", res.name);
      localStorage.setItem("medievalName", res.psw);*/
    }).catch(e => {
      console.log("Vous êtes un fossoyeur d'identité vilain !", e);
      // TODO le gueux n'existe pas
      //  => peut-être il se fait rattrapper par les garde aux chateau
    });

    return;
  }
  // TODO add to the condition if (no psw but name) or (no name but psw)
  if (localStorage.getItem("pswAttempts")) {
    // if the user already tried to connect with psw before, reset their attempts
    pswAttempts = 0;
    localStorage.setItem("pswAttempts", "0");
    // On reset les attemps si il rafraichit la page mais on laisse la page d'acceuil ?
    // oui carrément pour laisser les 2 options après j'aimais bien l'idée de changer le texte quand même
    // document.getElementById("douves").innerHTML = `<h3>Halte-là !</h3>
    //   <p>Je reconnois vostre visage.</p><p>Possedez-vous un mot de passe ?</p>`;
  }
  // les gardes apparaissent
  // document.getElementById("ask-name").style.display = "block";
  document.getElementById("ask-name").style.scale = "1";
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

async function apiNewGueux(name) {
  const targetForm = document.getElementById(currentDisplayedFormId);
  try {
    let res = await retrieveJSON(APIurl, { name });
    if (res){ // Success
      res = JSON.parse(res);
      targetForm.removeAttribute("state");
      localStorage.setItem("medievalPsw", res.psw);
      localStorage.setItem("medievalName", res.name);
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

async function apiCheckGueux(psw) {
  const targetForm = document.getElementById(currentDisplayedFormId);
  try {
    let res = await retrieveJSON(APIurl, { psw });
    if (res){ // Success
      res = JSON.parse(res);
      targetForm.removeAttribute("state");
      localStorage.setItem("medievalPsw", res.psw);
      localStorage.setItem("medievalName", res.name);
      openGates(res.name, true);
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
      openGates(name, true);
    });
  }, 3000);
}

var errorMessageElement = null;
var wrongOnce = false;
var APIurl = "https://europe-west9-choucroutemedievale.cloudfunctions.net/checkName";
var pswAttempts = null;

function choose(rpgBtn, callback){
  rpgBtn.parentElement.remove();
  callback();
}

function resetLocalStorage(){
  localStorage.removeItem("pswAttempts");
  localStorage.removeItem("medievalPsw");
  localStorage.removeItem("medievalName");
}

function passePartout(){
  localStorage.setItem("medievalName", "Segoline La Devergoigneuse");
  localStorage.setItem("medievalPsw", "Je suis ton maitre");
}

function displayError(msg=null){
  if (msg){
    errorMessageElement.querySelector('span').innerHTML = msg;
  }

  if (wrongOnce) {
    // Abusé
    errorMessageElement.classList.add("again");
    setTimeout(() => {
      errorMessageElement.classList.remove("again");
    }, 600);
  } else {
    wrongOnce = true;
    errorMessageElement.style.display = "flex";
  }
}

function submitName(evt) {
  evt.preventDefault();

  const name = evt.target.name ? evt.target.name.value : null;
  const adj = evt.target.adjectif ? evt.target.adjectif.value : null;
  if (!name) {
    displayError();
    return;
  }
  errorMessageElement.style.display = "none";
  let medievalName = `${name} ${adj}`;
  retrieveJSON(
      APIurl, { name: medievalName }
  ).then(res => {
    console.log(res);
  }).catch(res => {
    // WEIRD: the response is caught here
    res = JSON.parse(res.response);
    if (res.hasOwnProperty("error")){
      console.log(res.error);
      displayError("?? Quelle est cette sorcellerie ??");
      document.getElementById("name-submit").remove();
      return
    }
    console.log(res);
    switch (res.status) {
      case 'taken':
        // todo user already taken
        document.getElementById("name-taken").style.display = "flex";
        break;
      case 'add':
        // todo handle what if no psw and/or no name
        localStorage.setItem("medievalPsw", res.psw);
        localStorage.setItem("medievalPsw", res.name);
        openGates(res.name, true);
        // TODO SHOW PASSWORD TO USER
        break;
      case 'no-more-psw':
        // todo handle no more password
        break;
      case 'wtf':
      default:
        console.log("should not happen");
        displayError("?? Quelle est cette sorcellerie ??");
        document.getElementById("psw-submit").remove();
    }
  });
}

function submitPsw(evt) {
  evt.preventDefault();
  pswAttempts++;
  localStorage.setItem("pswAttempts", `${pswAttempts}`);
  if (pswAttempts > 3){
    displayError("!! Degouspillez sale maraud !!");
    document.getElementById("psw-submit").remove();
    // todo add: demande aux seigneurs
    return;
  }

  const medievalPsw = evt.target.psw ? evt.target.psw.value : null;
  console.log(medievalPsw);

  // TODO normalize password (no maj, spaces replaced by "-")

  retrieveJSON(
      APIurl, { psw: medievalPsw }
  ).then(res => {
    console.log(res);
  }).catch(res => {
    // WEIRD: the response is caught here
    res = JSON.parse(res.response);
    if (res.hasOwnProperty("error")){
      console.log(res.error);
      displayError("?? Essaye tu de nous tromper maraud ??");
      document.getElementById("psw-submit").remove();
      return
    }
    console.log(res);
    switch (res.status) {
      case 'update':
        // todo handle what if no psw and/or no name
        localStorage.setItem("medievalPsw", res.psw);
        localStorage.setItem("medievalName", res.name);
        openGates(res.name, true);
        break;
      case 'incorrect':
        displayError();
        break;
      case 'wtf':
      default:
        console.log("should not happen");
        displayError("?? Quelle diablerie avait vous faist ??");
        document.getElementById("psw-submit").remove();
    }
  });
}

function showName(){
  document.getElementById("douves").remove();
  document.getElementById("form-name").style.display = "block";

  errorMessageElement = document.getElementById("error-name");

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

function showPsw(){
  document.getElementById("douves").remove();
  document.getElementById("form-psw").style.display = "block";
  errorMessageElement = document.getElementById("error-psw");
}

function openGates(medievalName, submitted= false){
  document.getElementById("opendor").innerHTML = `Pénétrez au chateau<mark>${medievalName}</mark>`;
  if (submitted){
    document.getElementById("landing-name").classList.add("submitted");
  } else {
    document.getElementById("landing-name").remove();
  }

  // ici si un ptit filou a ajouté un medievalName + un medievalPsw dans son localStorage, il peut entrer
  // en revanche, il n'aura jamais de clans s'il fait ça 🤨

  // TODO allow say "je veux changer de nom"
}

document.addEventListener("DOMContentLoaded", function () {
  const medievalName = localStorage.getItem("medievalName");
  const medievalPsw = localStorage.getItem("medievalPsw");

  console.log({ medievalName, medievalPsw })

  if (medievalName && medievalPsw) {
    // ça passe les gardes
    openGates(medievalName);
    // API call to update last connection
    retrieveJSON(
        APIurl, { psw: medievalPsw }
    ).catch(res => {
      console.log(JSON.parse(res.response));
    });
    return;
  }
  // TODO add to the condition if (no psw but name) or (no name but psw)
  if (localStorage.getItem("pswAttempts")){
    // if the user already tried to connect with psw before, reset their attempts
    pswAttempts = 0;
    document.getElementById("choose-name").remove();
    document.getElementById("douves").innerHTML = `<h3>Halte-là !</h3>
      <p>Je reconnois vostre visage.</p><p>Quel est vostre mot de passe ?</p>`;
  }
  // les gardes apparaissent
  document.getElementById("ask-name").style.display = "block";
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
  ["L’Audicieux", "L’Audicieuse"],
  ["Le Dangereux", "La Dangereuse"],
];

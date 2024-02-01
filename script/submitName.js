var errorMessageElement = null;
var wrongOnce = false;

function submitName(evt) {
  evt.preventDefault();

  const name = evt.target.name ? evt.target.name.value : null;
  const adj = evt.target.adjectif ? evt.target.adjectif.value : null;
  if (!name) {
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
    return;
  }

  errorMessageElement.style.display = "none";
  const nameTaken = false; // TODO check if name is taken with API
  if (nameTaken) {
    document.getElementById("name_taken").style.display = "flex";
  } else {
    localStorage.setItem("medievalName", `${name} ${adj}`);
    document.getElementById("landing-name").classList.add("submitted");
    // TODO Save to API
  }
}

function iChoose(elId){

}

document.addEventListener("DOMContentLoaded", function () {
  const medievalName = localStorage.getItem("medievalName");

  /*if (medievalName) {
    console.log({ medievalName });
    document.getElementById("landing-name").remove();

    retrieveJSON(
        "https://europe-west9-choucroutemedievale.cloudfunctions.net/checkName",
        { name: medievalName }
    ).then(res => {
      res = JSON.parse(res).body;

      /!*if (!output && !isArray(output)){
        errMsg(output, data, "Result output of Fill by model function is not correctly formatted");
        return;
      }*!/
    }).catch(e => {
      console.table(JSON.parse(e.response).detail);
    });

    // TODO save to API
    // TODO allow say "c'est pas moi"

    // document.getElementById("ask-name").innerHTML = `<h1>Bienvenue <mark>${medievalName}</mark></h1>`;
    return;
  }*/
  const pswAttempts = localStorage.getItem("pswAttempts");
  if (pswAttempts){
    localStorage.setItem("pswAttempts", "0");
    // TODO do not show name / only mdp
  }

  document.getElementById("ask-name").style.display = "block";

  errorMessageElement = document.getElementById("errorMessage");

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
});

/*

ADJECTIFS

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

/*
Ont été mentionnés mais pas ajouté (je me dis ça va pas trop dans le thème ou autre..):
L'enculé
Le casanié
L'ivrogne (tout le monde voudra être l'ivrogne)
Le bleu
Le pubert
Le Zelé
Le puant
// Et la copilot me propose "Le puceau" AHA
// en vrai je pense qu'on pourra dédoublonner lâche/couard, vaillant/valeureux ?
*/


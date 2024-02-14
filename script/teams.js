const teams = {
    kraken: {
        color: "",
        title: "Le clan du Kraken"
    },
    ours: {
        color: "",
        title: "La faction de l'Ours"
    },
    cerf: {
        color: "",
        title: "Le fief du Cerf"
    },
    dragon: {
        color: "",
        title: "Le coterie du Dragon"
    },
    corbeau: {
        color: "",
        title: "La confrerie du Corbeau"
    },
};


const teamNames = Object.keys(teams)
var team, teamName, covered, timer, newText;

function drawTeam(){
    team = "dragon" // TODO here API call to get team
    document.getElementById("draw-team").classList.add("submitted");

    const teamReveal = document.getElementById("team-reveal").
    teamReveal.style.display = 'block';
    teamReveal.classList.add('bornInFlames');

    teamName = teams[team].title


    covered = teamName.replace(/[^\s]/g, '_');
    document.getElementById("team-name").innerHTML = covered;
    timer = setInterval(decode, 50);
}

function decode(){
    newtext = covered.split('').map(changeLetter()).join('');
    document.getElementById("team-name").innerHTML = newtext;
    if (teamName === covered){
        clearTimeout(timer);
        teamReveal();
        return false;
    }
    covered = newtext;
}

function changeLetter(){
    const replacements = "DLCOKabcdefghiklmnopqrstuvwxyz'";
    return function(letter, index, err){
        return teamName[index] === letter
            ? letter
            : replacements[Math.random() * replacements.length | 0];
    }
}

function teamReveal(){
    const explosionGif = document.getElementById('explosion');
    const teamGif = document.getElementById(team);

    explosionGif.style.display = 'block';

    setTimeout(() => {
        explosionGif.style.display = 'none';
    }, 800);
    setTimeout(() => {
        teamGif.style.display = 'block';
        teamGif.classList.add('bornInFlames');
    }, 250);
}
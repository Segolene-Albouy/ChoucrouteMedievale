const teams = {
    kraken: {
        color: "",
        title: "Le clan du Kraken"
    },
    ours: {
        color: "",
        title: "La tribu de l'Ours"
    },
    cerf: {
        color: "",
        title: "Le fief du Cerf"
    },
    dragon: {
        color: "",
        title: "Le coterie du dragon"
    },
    corbeau: {
        color: "",
        title: "La confrerie du corbeau"
    },
};


const teamNames = Object.keys(teams)
var team, teamName, covered, timer, newText;

function drawTeam(){
    team = teamNames[Math.random() * teamNames.length | 0];
    teamName = teams[team].title
    // TODO here API call to get team team

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
    const replacements = 'ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz';
    return function(letter, index, err){
        return teamName[index] === letter
            ? letter
            : replacements[Math.random() * replacements.length | 0];
    }
}

function teamReveal(){
    const explosionGif = document.getElementById('explosion');

    explosionGif.style.display = 'block';
    document.getElementById(team).style.display = 'block';

   /* setTimeout(() => {
        explosionGif.style.display = 'none';
    }, 2500);*/
}

/**
 * Environment: 2nd generation
 * Function name: checkName
 * Region: europe-west9
 * Trigger type: HTTPS
 * Authentication: allow unauthenticated
 */

/**
 * package.json:
 {
  "dependencies": {
    "@google-cloud/functions-framework": "^3.0.0",
    "@google-cloud/firestore": "^7.0.0"
  }
}
 */

// https://cloud.google.com/functions/docs/samples

const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectId: "choucroutemedievale",
  databaseId: "(default)",
});

const gueuxDb = firestore.collection("names");
const gameDb = firestore.collection("games");

/*
Game model
gameName:string
highscores:{
    gueuxName:string
    score:number,
    gueuTeam:string
}[]
*/

functions.http("games", async (req, res) => {
  try {
    if (req.method === "OPTIONS") {
      // Handle preflight request
      res.status(204).send("");
      return;
    }
    if (req.method == "POST") {
      const { gueuxName, gameName, highscore } = req.body;
      // Check author is gueux
      const gueuxQuery = await gueuxDb.where("name", "==", gueuxName).get();
      if (gueuxQuery.size == 0) {
        res
          .status(403)
          .send({ message: "?? Quelle diablerie avez vous faist ??" });
        return;
      }

      // Existing highscore
      const gameQuery = await gameDb.where("name", "==", gameName).get();
      if (gameQuery.size == 0) {
        res.status(400).send({ message: "Ce jeu n'existe point !" });
        return;
      }
      // Update gueux highscore
      const currentScore = gueuxQuery.docs[0].data()[gameName] || 0;
      if (currentScore < highscore) {
        await gueuxQuery.docs[0].ref.update({ [gameName]: highscore });
      }

      const game = gameQuery.docs[0];
      const highscores = game
        .data()
        .highscores.sort((a, b) => a.score - b.score); // Sort by score ascending
      // Check highscore needs to be added
      if (
        highscores.find(
          (hs) => hs.gueuxName === gueuxName && hs.score == highscore
        )
      ) {
        // Score is already saved
      } else if (highscores.length < 5) {
        highscores.push({
          gueuxName,
          score: highscore,
          gueuTeam: gueuxQuery.docs[0].data().team,
        });
        await game.ref.update({ highscores });
      } else if (highscore > highscores[0].score) {
        // Find index to replace
        let index = 0;
        while (
          index < highscores.length &&
          highscores[index].score > highscore
        ) {
          index++;
        }
        // Replace
        highscores[index] = {
          gueuxName,
          score: highscore,
          gueuTeam: gueuxQuery.docs[0].data().team,
        };
        await game.ref.update({ highscores });
      }
      res.status(200).send({ highscores });
    } else if (req.method == "GET") {
      const gueuxName = req.query.gueuxName;
      const gueuxQuery = await gueuxDb.where("name", "==", gueuxName).get();
      if (gueuxQuery.size == 0) {
        res
          .status(403)
          .send({ message: "?? Quelle diablerie avez vous faist ??" });
        return;
      }
      res.status(200).send(gueuxQuery.docs[0].data());
    }
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Erreur interne", error: e });
  }
});

const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectId: "choucroutemedievale",
  databaseId: "choucroute-dev",
});
const gueuxDb = firestore.collection("names");

functions.http("teamList", async (req, res) => {
  try {
    const { gueuName } = req.query;
    const gueuxQuery = await gueuxDb.where("name", "==", gueuName).get();
    if (gueuxQuery.size === 0) {
      res
        .status(403)
        .send({ message: "?? Quelle diablerie avez vous faist ??" });
      return;
    }
    const gueux = gueuxQuery.docs[0];
    if (gueux.data().team === "") {
      res.status(401).send({
        message:
          "Les mercenaires ne peuvent pas communiquer. Revenez lorsque l'étendard vous sera attribuer !",
      });
      return;
    }
    const teamQuery = await gueuxDb
      .where("team", "==", gueux.data().team)
      .get();
    const team = [];
    teamQuery.forEach((doc) => {
      team.push(doc.data().name);
    });
    res.status(200).send({ name: gueux.data().team, members: team });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Une erreur est survenue" });
  }
});

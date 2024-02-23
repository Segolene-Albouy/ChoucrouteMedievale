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
  databaseId: "choucroute-dev",
});

const gueuxDb = firestore.collection("names");

functions.http("changeAttendance", async (req, res) => {
  try {
    const { gueuxName, isComing } = req.body;
    // Check author is gueux
    const gueuxQuery = await gueuxDb.where("name", "==", gueuxName).get();
    if (gueuxQuery.size == 0) {
      res
        .status(403)
        .send({ message: "?? Quelle diablerie avez vous faist ??" });
      return;
    }

    const gueux = gueuxQuery.docs[0];
    await gueux.ref.update({ isComing });

    res.status(200).json({ message: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Erreur interne", error: e });
  }
});

/*
 else if (typeof isComing === "boolean"){
      const pswQuery = await gueuxDb.where("psw", "==", psw).get();
      if (pswQuery.size === 1) {
        await gueux.ref.update({isComing: isComing});
        statusCode = 200;
      } else {
        statusCode = pswQuery.size > 1 ? 500 : 400;
      }
    }

*/

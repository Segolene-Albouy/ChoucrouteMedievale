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
const mdpDb = firestore.collection("psw");

async function newPsw() {
  try {
    const freePswQuery = await mdpDb
        .where("attributed", "==", false)
        .limit(1)
        .get();

    if (!freePswQuery.empty) {
      const freePs = freePswQuery.docs[0];
      await freePs.ref.update({ attributed: true });
      return freePs.id;
    } else {
      console.error("No available passwords.");
      return null;
    }
  } catch (error) {
    console.error("Error when generating password:", error);
    throw error;
  }
}

async function newGueux(name, psw, ipAddress, now) {
  const gueuxData = {
    name: name,
    team: "",
    created: now,
    psw: psw,
    lastConnection: now,
    ips: [ipAddress],
  };

  await gueuxDb.doc(gueuxDb.doc().id).set(gueuxData);
  return gueuxData;
}

async function updateGueux(gueux, ipAddress, now) {
  const gueuxData = gueux.data();
  await gueux.ref.update({ lastConnection: now });
  if (!gueuxData.ips || !gueuxData.ips.includes(ipAddress)) {
    await gueux.ref.update({ ips: Firestore.FieldValue.arrayUnion(ipAddress) });
  }
  return gueuxData;
}

functions.http("checkName", async (req, res) => {
  let { name, psw } = req.body; // GET req.query / POST req.body

  /* WARNING ONLY FOR DEVELOPMENT */
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.status(204).send('');
    return;
  }

  /*if (name === "Segoline La Devergoigneuse"){
        res.status(201).json({
            greetings: `Hommage à toi, noble ${name} !`,
        });
    } else {
        const domain = req.headers.referer;
        if (!domain || !domain.includes('choucroute-medievale.tech')) {
            res.status(403).send(`Que croyais-tu, manand ?`);
            return;
        }
    }*/

  let statusCode = 500;
  try {
    const now = Firestore.FieldValue.serverTimestamp();
    const ipAddress = req.ip;


    if (name) {
      // The user submits a name
      const nameQuery = await gueuxDb.where("name", "==", name).get();

      if (nameQuery.size >= 1) {
        // the name is already taken
        statusCode = 401;
        if (nameQuery.size > 1)
          console.error("/!\\ Name was assigned multiple time /!\\");
      } else {
        // name not taken, create a new gueux profile
        psw = await newPsw();
        if (!psw) {
          statusCode = 500;
        } else {
          await newGueux(name, psw, ipAddress, now);
          statusCode = 201;
        }
      }
    } else if (psw) {
      // the user tries a psw
      const pswQuery = await gueuxDb.where("psw", "==", psw).get();

      if (pswQuery.size === 1) {
        // the password is correct
        const gueux = pswQuery.docs[0];
        name = gueux.data().name;
        await updateGueux(gueux, ipAddress, now);
        statusCode = 200;
      } else if (pswQuery.size > 1) {
        // that psw was attributed multiple time (should not happen)
        statusCode = 500;
      } else {
        // incorrect password
        statusCode = 400;
      }
    }

    res.status(statusCode).json({
      name,
      psw,
    });
  } catch (error) {
    res.status(500).json({
      error,
      name: null,
      psw: null,
    });
  }
});

/**
 * const castes = [
 *     "noble",
 *     "chevalier",
 *     "artisan",
 *     "paysan"
 * ];
 *
 * const teams = {
 *     corbeau: {
 *         color: "black"
 *     },
 *     cerf: {
 *         color: "green"
 *     },
 *     kraken: {
 *         color: "blue"
 *     },
 *     dragon: {
 *         color: "red"
 *     }
 * };
 */


/**
 * const castes = [
 *     "noble",
 *     "chevalier",
 *     "artisan",
 *     "paysan"
 * ];
 *
 * const teams = {
 *     corbeau: {
 *         color: "black"
 *     },
 *     cerf: {
 *         color: "green"
 *     },
 *     kraken: {
 *         color: "blue"
 *     },
 *     dragon: {
 *         color: "red"
 *     }
 * };
 */

const pswToAdd = ["turbo-prout"];

functions.http("addPsw", async (req, res) => {
  try {
    const promises = pswToAdd.map(async (psw) => {
      const docRef = mdpDb.doc(psw);
      const docSnapshot = await docRef.get();

      if (!docSnapshot.exists) {
        await docRef.set({ attributed: false });
      } else {
        await docRef.update({ attributed: false });
      }
    });

    await Promise.all(promises);

    res.status(200).json({
      message: "Documents added successfully",
    });
  } catch (error) {
    res.status(500).json({
      error,
    });
  }
});

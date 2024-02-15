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

async function newGueux(name, psw, team, isComing, ipAddress, now) {
  const gueuxData = {
    name: name,
    team: team,
    isComing: isComing,
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

async function getTeam(){
   const teams = {
       corbeau: 0,
       cerf: 0,
       kraken: 0,
       dragon: 0
   };

   let fewestMembers= 1000;
   let selectedTeam = "";

  const snapshot = await gueuxDb.get();
  snapshot.forEach((doc) => {
    const [team, isComing = false] = [doc.data().team, doc.data().isComing];
    if (teams.hasOwnProperty(team) && isComing) {
      teams[team]++;
      if (teams[team] < fewestMembers){
        fewestMembers = teams[team];
        selectedTeam = team;
      }
    }
  });
  return selectedTeam
}

functions.http("checkName", async (req, res) => {
  let { name, psw, team, isComing } = req.body; // GET req.query / POST req.body

  /* /!* WARNING ONLY FOR DEVELOPMENT *!/*/
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === 'OPTIONS') {
    // Handle preflight request
    res.status(204).send('');
    return;
  }

  const domain = req.headers.referer;
  if (!domain || !domain.includes('choucroute-medievale.tech')) {
    res.status(403).send(`Que croyais-tu, manand ?`);
    return;
  }

  let statusCode = 500;
  try {
    const now = Firestore.FieldValue.serverTimestamp();
    const ipAddress = req.ip;

    if (!team){
      team = getTeam();
    }

    if (name && !psw) {
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
          await newGueux(name, psw, team, ipAddress, now);
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
        await gueux.ref.update({ team: team }); // TODO does it need to be updated here?
        await updateGueux(gueux, ipAddress, now);
        statusCode = 200;
      } else if (pswQuery.size > 1) {
        // that psw was attributed multiple time (should not happen)
        statusCode = 500;
      } else {
        // incorrect password
        statusCode = 400;
      }
    } else if (typeof isComing === "boolean"){
      const pswQuery = await gueuxDb.where("psw", "==", psw).get();
      if (pswQuery.size === 1) {
        await gueux.ref.update({isComing: isComing});
        statusCode = 200;
      } else {
        statusCode = pswQuery.size > 1 ? 500 : 400;
      }
    }

    res.status(statusCode).json({
      name,
      psw,
      team
    });
  } catch (error) {
    res.status(500).json({
      error,
      name: null,
      psw: null,
      team: null
    });
  }
});

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

const functions = require('@google-cloud/functions-framework');
const { Firestore } = require('@google-cloud/firestore');

const firestore = new Firestore({
    projectId: 'choucroutemedievale',
    databaseId: 'choucroute-dev'
});

const gueuxDb = firestore.collection('names');
const mdpDb = firestore.collection('psw');

async function newPsw () {
    const freePsw = await mdpDb.where('attributed', '==', false).get();
    return freePsw.docs[0].id;
}

async function newGueux (name, psw, ipAddress, now) {
    const gueuxData = {
        name: name,
        team: "",
        created: now,
        psw: psw,
        lastConnection: now,
        ips: [ipAddress]
    };

    await gueuxDb.doc(gueuxDb.doc().id).set(gueuxData);
    return gueuxData
}

async function updateGueux (gueux, ipAddress, now) {
    const gueuxData = gueux.data();
    await gueux.ref.update({ lastConnection: now });
    if (!gueuxData.ips || !gueuxData.ips.includes(ipAddress)) {
        await gueux.ref.update({ ips: Firestore.FieldValue.arrayUnion(ipAddress) });
    }
    return gueuxData;
}

functions.http('setName', async (req, res) => {
    let { name, psw } = req.body; // GET req.query / POST req.body

    /* WARNING ONLY FOR DEVELOPMENT */
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');

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

    let status;
    try {
        const now = Firestore.FieldValue.serverTimestamp();
        const ipAddress = req.ip;

        // The user submits a name
        if (name){
            const nameQuery = await gueuxDb.where('name', '==', name).get();
            // const ipQuery = await gueuxDb.where('ips', 'array-contains', ipAddress).get();

            if (nameQuery.size === 1) {
                // the name is already taken
                status = "taken"
            } else if (nameQuery.size > 1) {
                // tha name was attributed multiple time (should not happen)
                status = "wtf";
            } else {
                // name not taken, create a new gueux profile
                psw = newPsw();
                await newGueux(name, psw, ipAddress, now)
                status = "add";
            }
        } else if (psw){
            // the user tries a psw
            const pswQuery = await gueuxDb.where('psw', '==', psw).get();

            if (pswQuery.size === 1) {
                // the password is correct
                status = "update"
                await updateGueux(pswQuery.docs[0], ipAddress, now);
            } else if (pswQuery.size > 1) {
                // that psw was attributed multiple time (should not happen)
                status = "wtf";
            } else {
                // incorrect password
                status = "incorrect";
            }
        }

        res.status(201).json({
            name,
            psw,
            status
        });
    } catch (error) {
        res.status(500).json({
            error,
            status: "error",
            name: null,
            psw: null
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

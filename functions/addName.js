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

const castes = [
    "noble",
    "chevalier",
    "artisan",
    "paysan"
];

const teams = {
    corbeau: {
        color: "black"
    },
    cerf: {
        color: "green"
    },
    kraken: {
        color: "blue"
    },
    dragon: {
        color: "red"
    }
};

const firestore = new Firestore({
    projectId: 'choucroutemedievale',
    databaseId: 'choucroute-dev'
});

const gueuxDb = firestore.collection('names');

functions.http('setName', async (req, res) => {
    try {
        const now = Firestore.FieldValue.serverTimestamp();

        // GET req.query
        // POST req.body
        const { name, fromLocalStorage } = req.body;
        const ipAddress = req.ip;

        const nameQuery = await gueuxDb.where('name', '==', name).get();
        const ipQuery = await gueuxDb.where('ips', 'array-contains', ipAddress).get();

        // TODO difference entre info venues du fileStorage ou non
        // ajouter une nouvelle ip si même nom et nouvel ip
        // forcer que la requête vienne de choucroute-medievale.tech

        let status;
        if (nameQuery.size === 1) {
            const gueuxDoc = nameQuery.docs[0];
            const gueuxData = gueuxDoc.data();

            await gueuxDoc.ref.update({ lastConnection: now });
            if (!gueuxData.ips || !gueuxData.ips.includes(ipAddress)) {
                await gueuxDoc.ref.update({ ips: Firestore.FieldValue.arrayUnion(ipAddress) });
            }

            status = "update";
        } else if (nameQuery.size > 1) {
            status = "wtf";
        } else {
            // Name not associated, create a new gueux profile
            const newGueux = {
                name: name,
                team: "",
                created: now,
                lastConnection: now,
                ips: [ipAddress]
            };

            await gueuxDb.doc(gueuxDb.doc().id).set(newGueux);
            status = "add";
        }

        // res.send(`Bienvenue à toi, ${name}!`);
        res.status(201).json({
            greetings: `Bienvenue à toi, ${name}!`,
            ip: ipAddress,
            status
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});

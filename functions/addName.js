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
const mdpDb = firestore.collection('psw');

functions.http('setName', async (req, res) => {
    const domain = req.headers.referer;
    if (!domain || !domain.includes('choucroute-medievale.tech')) {
        res.status(403).send(`Que croyais-tu, manand ?`);
        return;
    }

    try {
        const now = Firestore.FieldValue.serverTimestamp();

        // GET req.query
        // POST req.body
        const { name, psw } = req.body;
        const ipAddress = req.ip;

        if (name){
            const nameQuery = await gueuxDb.where('name', '==', name).get();
            // const ipQuery = await gueuxDb.where('ips', 'array-contains', ipAddress).get();

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
                res.status(201).json({
                    greetings: `Bienvenue à toi, ${name}!`,
                    ip: ipAddress,
                    status
                });
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

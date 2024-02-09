const functions = require("@google-cloud/functions-framework");
const { Firestore } = require("@google-cloud/firestore");

const firestore = new Firestore({
  projectId: "choucroutemedievale",
  databaseId: "choucroute-dev",
});

const forumDB = firestore.collection("forum");
/*
Thread model:
title: string;
author: string;
team:string;
messages: {
    content: string;
    author:string;
    datetime:string;
    }[]
*/

const gueuxDb = firestore.collection("names");

functions.http("newThread", async (req, res) => {
  try {
    const { title, author, message } = req.body;
    // Check author is gueux
    const gueuxQuery = await gueuxDb.where("name", "==", author).get();
    if (gueuxQuery.size == 0) {
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
    const threadData = {
      title,
      author,
      team: gueux.data().team,
      messages: [
        {
          content: message,
          author,
          datetime: new Date().toISOString(),
        },
      ],
    };

    const threadRef = await forumDB.add(threadData);

    res.status(200).send(threadRef);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Erreur interne", error: e });
  }
});

functions.http("getThread", async (req, res) => {
  try {
    const { threadId, gueuName } = req.query;
    if (!threadId || !gueuName) {
      res.status(400).send({ message: "Missing parameters" });
      return;
    }
    // Check author is gueux
    const gueuxQuery = await gueuxDb.where("name", "==", gueuName).get();
    if (gueuxQuery.size == 0) {
      res
        .status(403)
        .send({ message: "?? Quelle diablerie avez vous faist ??" });
      return;
    }
    const threadQuery = await forumDB.doc(threadId).get();
    if (!threadQuery.exists) {
      res.status(404).send({ message: "Thread not found" });
      return;
    }
    // Check author is in the same team
    const thread = threadQuery.data();
    if (thread.team !== gueuxQuery.docs[0].data().team) {
      res.status(401).send({ message: "L'espionnage est passible de mort !" });
      return;
    }
    thread.messages = thread.messages.sort((a, b) => a.datetime - b.datetime);
    res.status(200).send(thread);
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Erreur interne", error: e });
  }
});

functions.http("newMessage", async (req, res) => {
  try {
    const { threadId, author, message } = req.body;
    // Check author is gueux
    const gueuxQuery = await gueuxDb.where("name", "==", author).get();
    if (gueuxQuery.size == 0) {
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

    // Check thread valid
    const thread = await forumDB.doc(threadId).get();
    if (!thread.exists) {
      res
        .status(404)
        .send({ message: "?? Quelle diablerie avez vous faist ??" });
      return;
    }
    const threadData = thread.data();
    threadData.messages.push({
      content: message,
      author,
      datetime: new Date().toISOString(),
    });
    await forumDB.doc(threadId).update(threadData);
    res.status(200).send({ status: "ok" });
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Erreur interne", error: e });
  }
});

functions.http("getThreads", async (req, res) => {
  try {
    const team = req.query.team;
    const threadsQuery = await forumDB.where("team", "==", team).get();
    const threads = [];
    threadsQuery.forEach((t) => {
      const rawThread = t.data();
      threads.push({
        id: t.id,
        title: rawThread.title,
        author: rawThread.author,
        messageNb: rawThread.messages.length,
        lastMessageTime:
          rawThread.messages[rawThread.messages.length - 1].datetime,
        lastMessageAuthor:
          rawThread.messages[rawThread.messages.length - 1].author,
      });
    });
    res
      .status(200)
      .send(
        threads.sort(
          (a, b) =>
            new Date(b.lastMessageTime).getTime() -
            new Date(a.lastMessageTime).getTime()
        )
      );
  } catch (e) {
    console.error(e);
    res.status(500).send({ message: "Erreur interne", error: e });
  }
});

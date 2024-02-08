var activeDiscussion = null;
const patrieGueu = {
  name: "Ours blancs du pole sud",
  members: [
    { name: "dev_name" },
    { name: "Didi Le Goulu" },
    { name: "Ségolène La Dévergoigneuse" },
  ],
};
function loadForum() {
  resetCursor();

  // load team info
  // Team name
  document.querySelectorAll(".team").forEach((t) => {
    t.innerHTML = patrieGueu.name;
  });
  // Team members
  const teamList = document.querySelector("#team-list");
  patrieGueu.members.forEach((member) => {
    const memberLi = document.createElement("li");
    memberLi.innerHTML = member.name;
    teamList.appendChild(memberLi);
  });

  // load messages
  apiLoadDiscussionList(patrieGueu.name).then((threads) => {
    loadDiscussions(threads);
  });
}

function loadDiscussions(threads) {
  const discussionList = document.getElementById("discussion-list");
  // Clean discussion list
  discussionList
    .querySelectorAll(".discussion-preview:not(.template)")
    .forEach((elt) => elt.remove());
  for (let {
    title,
    author,
    messageNb,
    lastMessageTime,
    lastMessageAuthor,
    id,
  } of threads) {
    const discussionPreview = document
      .querySelector(".discussion-preview.template")
      .cloneNode(true);
    discussionPreview.classList.remove("template");
    discussionPreview.querySelector("[role='title']").innerText = title;
    discussionPreview.querySelector("[role='author']").innerText = author;
    discussionPreview.querySelector("[role='msg-number']").innerText =
      messageNb + " message" + (messageNb > 1 ? "s" : "");
    discussionPreview.querySelector("[role='last-author']").innerText =
      lastMessageAuthor;
    discussionPreview.querySelector("[role='last-datetime']").innerText =
      formatFullDateTime(new Date(lastMessageTime));
    discussionPreview.addEventListener("click", () => {
      apiLoadDiscussion(id, patrieGueu.name).then(focusDiscussion);
    });
    discussionList.appendChild(discussionPreview);
  }
}

function unloadForum() {
  // reset forum home page
  activeDiscussion = null;
}

function focusDiscussion(discussion) {
  activeDiscussion = discussion;
  document.getElementById("discussion-list").style.display = "none";
  document.getElementById("focused-discussion").style.display = "block";
  const messagesElement = document.getElementById("discussion-messages");
  messagesElement
    .querySelectorAll(".message:not(.template)")
    .forEach((elt) => elt.remove());

  document
    .getElementById("focused-discussion")
    .querySelector("[role=title]").innerText = discussion.title;
  // Messages
  let currentAuthor = null;
  let lastChild = null;
  for (let message of discussion.messages) {
    const messageElement = createMessageElement(
      message.content,
      message.author
    );
    // On montre pas l'author si le message d'avant vient du même
    if (currentAuthor == message.author)
      messageElement.querySelector("[role='author']").innerText = "";

    currentAuthor = message.author;
    lastChild = messagesElement.appendChild(messageElement);
  }
  lastChild.scrollIntoView(false);
}

function createMessageElement(message, author) {
  const messageTemplate = document
    .querySelector(".message.template")
    .cloneNode(true);
  messageTemplate.classList.remove("template");
  if (author != getConnectedUser().name)
    messageTemplate.querySelector("[role='author']").innerText = author;
  messageTemplate.querySelector("[role='message']").innerText = message;
  if (author == getConnectedUser().name)
    messageTemplate.classList.add("self-message");
  return messageTemplate;
}

function submitDiscussion(evt) {
  evt.preventDefault();

  const {
    discussionTitle: { value: title },
    discussionMessage: { value: message },
  } = evt.target;

  if (title.trim().length == 0 || message.trim().length == 0) {
    alert("Saisi du contenu dans ton message sale gueux !");
    return;
  }

  evt.target.setAttribute("state", "loading");
  const author = getConnectedUser().name;
  console.log({ title, message, author });

  // TODO api request "newThread"
  setTimeout(() => {
    evt.target.setAttribute("state", "success");
    evt.target.reset();
    evt.target.parentElement
      .querySelector("[role=collapse-trigger]")
      .classList.add("collapsed");
  }, 1000);
}

function goBackToDiscussions() {
  document.getElementById("discussion-list").style.display = "block";
  document.getElementById("focused-discussion").style.display = "none";
  apiLoadDiscussionList(patrieGueu.name).then((threads) => {
    loadDiscussions(threads);
  });
}

function submitMessage(evt) {
  evt.preventDefault();

  if (evt.target.message.value.trim().length == 0) {
    alert("Saisi du contenu dans ton message sale gueux !");
    return;
  }

  const message = evt.target.message.value;
  const author = getConnectedUser().name;

  const newMessageElement = createMessageElement(message, author);
  document.getElementById("discussion-messages").appendChild(newMessageElement);
  //   newMessageElement.scrollIntoView(false);
  evt.target.reset();

  apiSendMessage(activeDiscussion.id, message, author);
}

async function apiLoadDiscussionList() {
  return mockThreads;
}

async function apiLoadDiscussion(threadId, patrieGueuName) {
  return mockThreads.find((thread) => thread.id === threadId);
}

async function apiSendMessage(threadId, message, author) {
  // TODO call api "newMessage"
}
const mockThreads = [
  {
    id: 1,
    author: "Didi Le Goulu",
    title: "A ki on nik la gueul ?",
    lastMessageTime: new Date("2024-02-05T14:05:00"),
    lastMessageAuthor: "dev_name",
    messages: [
      // Messages générés par Github Copilot: Grande barres de rires
      {
        author: "Didi Le Goulu",
        content: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        content: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        content: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        content:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        content: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        content: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        content: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        content: "On se casse",
      },
      {
        author: "Didi Le Goulu",
        content: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        content: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        content: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        content:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        content: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        content: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        content: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        content: "On se casse",
      },
      {
        author: "Didi Le Goulu",
        content: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        content: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        content: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        content:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        content: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        content: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        content: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        content: "On se casse",
      },
      {
        author: "Didi Le Goulu",
        content: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        content: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        content: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        content:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        content: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        content: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        content: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        content: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        content: "On se casse",
      },
    ],
  },
  {
    id: 2,
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    lastMessageAuthor: "dev_name",
    messages: [
      {
        author: "dev_name",
        content: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    id: 3,
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    lastMessageAuthor: "dev_name",
    messages: [
      {
        author: "dev_name",
        content: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    id: 4,
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    lastMessageAuthor: "dev_name",

    messages: [
      {
        author: "dev_name",
        content: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    id: 5,
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    lastMessageAuthor: "dev_name",

    messages: [
      {
        author: "dev_name",
        content: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    id: 6,
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    lastMessageAuthor: "dev_name",

    messages: [
      {
        author: "dev_name",
        content: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    id: 7,
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    lastMessageAuthor: "dev_name",

    messages: [
      {
        author: "dev_name",
        content: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
];

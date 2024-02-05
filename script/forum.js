var forumHasLoaded = false;
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
  if (forumHasLoaded) return;

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
  forumHasLoaded = true;
}

function loadDiscussions(threads) {
  const discussionList = document.getElementById("discussion-list");
  for (let { title, author, messages, lastMessageTime } of threads) {
    const discussionPreview = document
      .querySelector(".discussion-preview.template")
      .cloneNode(true);
    discussionPreview.classList.remove("template");
    discussionPreview.querySelector("[role='title']").innerText = title;
    discussionPreview.querySelector("[role='author']").innerText = author;
    discussionPreview.querySelector("[role='msg-number']").innerText =
      messages.length + " message" + (messages.length > 1 ? "s" : "");
    const lastMessage = messages[messages.length - 1];
    discussionPreview.querySelector("[role='last-author']").innerText =
      lastMessage.author;
    discussionPreview.querySelector("[role='last-datetime']").innerText =
      formatFullDateTime(lastMessageTime);
    discussionPreview.addEventListener("click", () => {
      apiLoadDiscussion(title, patrieGueu.name).then(focusDiscussion);
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
  const { name: connectedUser } = getConnectedUser();
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
      message.message,
      message.author
    );

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

  console.log({ title, message });

  evt.target.setAttribute("state", "loading");

  setTimeout(() => {
    evt.target.setAttribute("state", "success");
    evt.target.reset();
    evt.target.parentElement
      .querySelector("[role=collapse-trigger]")
      .classList.add("collapsed");
  }, 1000);
}

function goBackToDiscussions() {
  console.log("heyy");
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

  apiSendMessage(activeDiscussion.title, patrieGueu.name, { message, author });
}

async function apiLoadDiscussionList() {
  return mockThreads;
}

async function apiLoadDiscussion(threadTitle, patrieGueuName) {
  return mockThreads.find((thread) => thread.title === threadTitle);
}

async function apiSendMessage(threadTitle, patrieGueuName, message) {}
const mockThreads = [
  {
    author: "Didi Le Goulu",
    title: "A ki on nik la gueul ?",
    lastMessageTime: new Date("2024-02-05T14:05:00"),
    messages: [
      // Messages générés par Github Copilot: Grande barres de rires
      {
        author: "Didi Le Goulu",
        message: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        message: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        message: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        message:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        message: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        message: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        message: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        message: "On se casse",
      },
      {
        author: "Didi Le Goulu",
        message: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        message: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        message: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        message:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        message: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        message: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        message: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        message: "On se casse",
      },
      {
        author: "Didi Le Goulu",
        message: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        message: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        message: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        message:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        message: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        message: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        message: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        message: "On se casse",
      },
      {
        author: "Didi Le Goulu",
        message: "Salut les gars, je suis le deuxième à poster ici !",
      },
      {
        author: "dev_name",
        message: "On fait quoi ?",
      },
      {
        author: "Didi Le Goulu",
        message: "Qu'est-ce que vous pensez de la situation ?",
      },

      {
        author: "Didi Le Goulu",
        message:
          "Vis-àvis de la situation actuelle, je propose qu'on fasse une réunion pour en discuter.",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "J'ai pas compris la question",
      },
      {
        author: "Didi Le Goulu",
        message: "Moi je dirais que c'est la faute à Clément",
      },
      {
        author: "dev_name",
        message: "Je suis d'accord avec Didi",
      },
      {
        author: "Didi Le Goulu",
        message: "Mais plutot pour une autre raison",
      },
      {
        author: "Segolene La Devergoigneuse",
        message: "D'accord on fait quoi maintenant ?",
      },
      {
        author: "dev_name",
        message: "On se casse",
      },
    ],
  },
  {
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    messages: [
      {
        author: "dev_name",
        message: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),
    messages: [
      {
        author: "dev_name",
        message: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),

    messages: [
      {
        author: "dev_name",
        message: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),

    messages: [
      {
        author: "dev_name",
        message: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),

    messages: [
      {
        author: "dev_name",
        message: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
  {
    author: "dev_name",
    title: "Bienvenue les srabs !",
    lastMessageTime: new Date("2021-01-01T12:00:00"),

    messages: [
      {
        author: "dev_name",
        message: "Salut les gars, je suis le premier à poster ici !",
      },
    ],
  },
];

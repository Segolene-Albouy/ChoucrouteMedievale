const apiURL = "https://europe-west9-choucroutemedievale.cloudfunctions.net/";
var activeDiscussion = null;
var etendard;

function loadForum() {
  resetCursor();

  apiGetTeamInfos()
    .then(({ name, members }) => {
      etendard = name;
      displayTeamInfo(members);
      loadDiscussions();
    })
    .catch((e) => {
      if (e.status < 500) warningPopup(e.message);
      else errorPopup(e.message);
    });
}

function displayTeamInfo(members) {
  document.querySelectorAll(".team").forEach((t) => {
    t.innerHTML = etendard;
  });
  // Team members
  const teamList = document.querySelector("#team-list");
  members.forEach((member) => {
    const memberLi = document.createElement("li");
    memberLi.innerHTML = member;
    teamList.appendChild(memberLi);
  });
}

function loadDiscussions() {
  document.getElementById("discussion-list").setAttribute("state", "loading");
  // load messages
  apiLoadDiscussionList(etendard)
    .then((threads) => {
      displayDiscussions(threads);
    })
    .catch((e) => {
      if (e.status < 500) warningPopup(e.message);
      else errorPopup(e.message);
    })
    .finally(() => {
      document.getElementById("discussion-list").removeAttribute("state");
    });
}

function displayDiscussions(threads) {
  const discussionList = document.getElementById("discussion-list");
  // Clean discussion list
  discussionList
    .querySelectorAll(".discussion-preview:not(.template)")
    .forEach((elt) => elt.remove());
  document.getElementById("empty-discussion").style.display = "none";

  if (threads.length === 0) {
    document.getElementById("empty-discussion").style.display = "block";
    return;
  }
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
      document
        .getElementById("focused-discussion")
        .setAttribute("state", "loading");
      document.getElementById("discussion-list").style.display = "none";
      document.getElementById("focused-discussion").style.display = "block";
      apiLoadDiscussion(id, getConnectedUser().name)
        .then((res) => focusDiscussion({ id, ...res }))
        .catch((e) => {
          if (e.status < 500) warningPopup(e.message);
          else errorPopup(e.message);
        })
        .finally(() => {
          document
            .getElementById("focused-discussion")
            .removeAttribute("state");
        });
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
    errorPopup("Saisi du contenu dans ton message sale gueux !");
    return;
  }

  evt.target.setAttribute("state", "loading");
  const author = getConnectedUser().name;
  console.log({ title, message, author });

  apiNewThread(title, message, author)
    .then(() => {
      loadDiscussions();
    })
    .catch((e) => {
      if (e.status < 500) warningPopup(e.message);
      else errorPopup(e.message);
    })
    .finally(() => {
      evt.target.setAttribute("state", "success");
      evt.target.reset();
      evt.target.parentElement
        .querySelector("[role=collapse-trigger]")
        .classList.add("collapsed");
    });
}

function goBackToDiscussions() {
  document.getElementById("discussion-list").style.display = "block";
  document.getElementById("focused-discussion").style.display = "none";
  loadDiscussions();
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

  if (!hasUsedForum()) {
    // Faire une popup avec un vieux monsieur ou autre
    // "Bonjour visiteur, c'est la première fois que tu utilises le pigeonnier dit-moi...
    //  Si tu souhaites voir les réponses de tes compatriotes tu dois faire un pas en arrière et revenir sur le pigeon qui t'intéresse."
  }

  evt.target.setAttribute("state", "loading");
  apiSendMessage(activeDiscussion.id, message, author).finally(() => {
    evt.target.removeAttribute("state");
  });
}

async function apiNewThread(title, message, author) {
  const requestBody = { title, message, author };
  return retrieveJSON(apiURL + "newThread", requestBody);
}

async function apiLoadDiscussionList(gueuTeamName) {
  return retrieveJSON(
    apiURL +
      "getThreads?" +
      new URLSearchParams({ team: gueuTeamName }).toString()
  );
}

async function apiLoadDiscussion(threadId, gueuName) {
  return retrieveJSON(
    apiURL +
      "getThread?" +
      new URLSearchParams({ threadId, gueuName }).toString()
  );
}

async function apiSendMessage(threadId, message, author) {
  const requestBody = { threadId, message, author };
  return retrieveJSON(apiURL + "newMessage", requestBody);
}

function hasUsedForum() {
  return localStorage.getItem("forumUsed") != null;
}

function apiGetTeamInfos() {
  const gueuName = getConnectedUser().name;

  return retrieveJSON(
    apiURL + "teamList?" + new URLSearchParams({ gueuName }).toString()
  );
}

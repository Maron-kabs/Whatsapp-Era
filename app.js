const socket = io();

const messagesEl = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const chatHeaderName = document.querySelector(".chat-header h3");
const statusEl = document.querySelector(".chat-header small");
const chats = document.querySelectorAll(".chat");

// -------------------------
// DATA STRUCTURE (IMPORTANT)
// -------------------------

let activeChat = "Alex";

let chatData = JSON.parse(localStorage.getItem("chatData")) || {
    "Alex": [],
    "Sarah": [],
    "John": []
};

// -------------------------
// SAVE + LOAD
// -------------------------

function saveData() {
    localStorage.setItem("chatData", JSON.stringify(chatData));
}

// -------------------------
// TIME
// -------------------------

function timeNow() {
    const d = new Date();
    let h = d.getHours();
    let m = d.getMinutes();
    if (m < 10) m = "0" + m;
    return `${h}:${m}`;
}

// -------------------------
// RENDER CHAT
// -------------------------

function renderChat(chatName) {
    messagesEl.innerHTML = "";

    chatData[chatName].forEach(msg => {
        createMessage(msg.text, msg.type, msg.time);
    });

    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// -------------------------
// CREATE MESSAGE UI
// -------------------------

function createMessage(text, type, time) {
    const div = document.createElement("div");
    div.classList.add("message", type);

    div.innerHTML = `
        ${text}
        <span>${time}</span>
    `;

    messagesEl.appendChild(div);
}

// -------------------------
// SEND MESSAGE
// -------------------------

function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const msg = {
        text,
        type: "sent",
        time: timeNow()
    };

    chatData[activeChat].push(msg);
    saveData();

    createMessage(msg.text, msg.type, msg.time);

    socket.emit("chat-message", {
        chat: activeChat,
        text: text,
        time: msg.time
    });

    input.value = "";
    messagesEl.scrollTop = messagesEl.scrollHeight;
}

// -------------------------
// RECEIVE MESSAGE
// -------------------------

socket.on("chat-message", data => {
    if (!chatData[data.chat]) {
        chatData[data.chat] = [];
    }

    const msg = {
        text: data.text,
        type: "received",
        time: data.time
    };

    chatData[data.chat].push(msg);
    saveData();

    if (data.chat === activeChat) {
        createMessage(msg.text, msg.type, msg.time);
    }
});

// -------------------------
// SWITCH CHAT
// -------------------------

chats.forEach(chat => {
    chat.addEventListener("click", function () {

        chats.forEach(c => c.classList.remove("active"));
        this.classList.add("active");

        activeChat = this.querySelector(".chat-name").textContent;

        chatHeaderName.textContent = activeChat;

        renderChat(activeChat);
    });
});

// -------------------------
// ENTER KEY
// -------------------------

input.addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});

sendBtn.addEventListener("click", sendMessage);

// -------------------------
// ONLINE STATUS SIMULATION
// -------------------------

const statuses = ["Online", "Typing...", "Last seen recently"];
let i = 0;

setInterval(() => {
    statusEl.textContent = statuses[i];
    i = (i + 1) % statuses.length;
}, 5000);

// -------------------------
// INITIAL LOAD
// -------------------------

renderChat(activeChat);
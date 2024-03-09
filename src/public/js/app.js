const messageList = document.querySelector("#messages");
const messageForm = document.querySelector("#messageForm");
const nicknameForm = document.querySelector("#nicknameForm");

const socket = new WebSocket(`ws://${window.location.host}`);

function makeMessage(type, payload) {
  return JSON.stringify({ type, payload });
}

socket.addEventListener("open", () => {
  console.log("✅ Connected to Server");
});

socket.addEventListener("message", (message) => {
  const li = document.createElement("li");
  li.innerText = message.data;
  messageList.append(li);
});

socket.addEventListener("close", () => {
  console.log("❌ Disconnected from Server");
});

function messageHandleSubmit(event) {
  event.preventDefault();
  const input = messageForm.querySelector("input");
  if (input.value === "") {
    return;
  }
  socket.send(makeMessage("new_message", input.value));
  const li = document.createElement("li");
  li.innerText = `You: ${input.value}`;
  messageList.append(li);
  input.value = "";
}

function nicknameHandleSubmit(event) {
  event.preventDefault();
  const input = nicknameForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
  input.value = "";
}

messageForm.addEventListener("submit", messageHandleSubmit);
nicknameForm.addEventListener("submit", nicknameHandleSubmit);

const socket = io();

const welcome = document.getElementById("welcome");
const form = document.querySelector("form");
const room = document.getElementById("room");
const message = document.getElementById("message");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.append(li);
}

function handleMessageSubmit(event) {
  event.preventDefault();
  const input = message.querySelector("input");
  const value = input.value;
  socket.emit("new_message", value, roomName, () => {
    addMessage(`You: ${value}`);
  });
  input.value = "";
}

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerText = `"${roomName}" Room`;
  message.addEventListener("submit", handleMessageSubmit);
}

function handleRoomSubmit(event) {
  event.preventDefault();
  const roomInput = form.querySelector("#roomInput");
  const nameInput = form.querySelector("#nameInput");
  if (roomInput.value === "" || nameInput.value === "") return;
  socket.emit("nickname", nameInput.value);
  socket.emit("enter_room", roomInput.value, showRoom);
  roomName = roomInput.value;
  roomInput.value = "";
  nameInput.value = "";
}

form.addEventListener("submit", handleRoomSubmit);

socket.on("join", addMessage);

socket.on("leave", addMessage);

socket.on("new_message", addMessage);

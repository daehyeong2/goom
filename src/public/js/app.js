const socket = io();

const welcome = document.getElementById("welcome");
const form = document.querySelector("form");
const room = document.getElementById("room");
const message = document.getElementById("message");
const roomList = document.getElementById("rooms");

room.hidden = true;

let roomName;

function paintTitle(newCount) {
  const h3 = room.querySelector("h3");
  h3.innerText = `"${roomName}" Room (${newCount})`;
}

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

function showRoom(newCount) {
  welcome.hidden = true;
  room.hidden = false;
  paintTitle(newCount);
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

socket.on("join", (user, newCount) => {
  addMessage(`${user} joined!`);
  paintTitle(newCount);
});

socket.on("leave", (user, newCount) => {
  addMessage(`${user} left.`);
  paintTitle(newCount);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  roomList.innerHTML = "";
  rooms.forEach((roomName) => {
    const li = document.createElement("li");
    li.innerText = roomName;
    roomList.append(li);
  });
});

const socket = io();

const myVideo = document.getElementById("myVideo");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");
const call = document.getElementById("call");
const chat = document.getElementById("chat");
const chatForm = chat.querySelector("form");
const chatInput = chatForm.querySelector("input");
const messages = document.getElementById("messages");

call.hidden = true;

let myStream;
let peerFace;
let muted = false;
let cameraOff = false;
let roomName;
/** @type {RTCPeerConnection} */
let myPeerConnection;
let myDataChannel;

async function getCameras() {
  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      if (currentCamera.label === camera.label) {
        option.selected = true;
      }
      camerasSelect.appendChild(option);
    });
    const option = document.createElement("option");
    option.value = "screenShare";
    option.innerText = "화면 공유";
    camerasSelect.appendChild(option);
  } catch (e) {
    console.log(e);
  }
}

async function getMedia(deviceId) {
  const initialConstrains = {
    audio: true,
    video: { facingMode: "user" },
  };
  const cameraConstrains = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };
  try {
    myStream = await navigator.mediaDevices.getUserMedia(
      deviceId ? cameraConstrains : initialConstrains
    );
    myVideo.srcObject = myStream;
    if (!deviceId) {
      await getCameras();
    }
  } catch (e) {
    console.log(e);
  }
}

function handleMuteClick() {
  myStream
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (muted) {
    const i = muteBtn.children[0];
    i.classList = "fa-solid fa-microphone";
    muted = false;
  } else {
    const i = muteBtn.children[0];
    i.classList = "fa-solid fa-microphone-slash";
    muted = true;
  }
}
function handleCameraClick() {
  myStream
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    const i = cameraBtn.children[0];
    i.classList = "fa-solid fa-video";
    cameraOff = false;
  } else {
    const i = cameraBtn.children[0];
    i.classList = "fa-solid fa-video-slash";
    cameraOff = true;
  }
}

async function handleCameraChange() {
  if (camerasSelect.value === "screenShare") {
    try {
      myStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });
      myVideo.srcObject = myStream;
    } catch (e) {
      console.log(e);
    }
  } else {
    await getMedia(camerasSelect.value);
  }
  if (myPeerConnection) {
    const videoTrack = myStream.getVideoTracks()[0];
    const videoSender = myPeerConnection
      .getSenders()
      .find((sender) => sender.track.kind === "video");
    videoSender.replaceTrack(videoTrack);
  }
}

async function initCall() {
  welcome.style.display = "none";
  call.style.display = "flex";
  await getMedia();
  makeConnection();
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);

// Welcome Form (join a room)

const welcome = document.getElementById("welcome");
welcome.style.display = "flex";
const welcomeForm = welcome.querySelector("form");

async function handleWelcomeSubmit(event) {
  event.preventDefault();
  const input = welcomeForm.querySelector("input");
  await initCall();
  socket.emit("join_room", input.value);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Socket Code

function handleGetMessage(event) {
  const li = document.createElement("li");
  li.innerText = event.data;
  li.classList.add("peer");
  messages.appendChild(li);
  li.scrollIntoView();
}

function onPeerLeave() {
  peerFace.srcObject = undefined;
  const li = document.createElement("li");
  li.innerText = "--상대방이 퇴장했습니다.--";
  li.classList.add("peer");
  messages.appendChild(li);
}

socket.on("join_room", async () => {
  myDataChannel = myPeerConnection.createDataChannel("chat");
  myDataChannel.addEventListener("message", handleGetMessage);
  const offer = await myPeerConnection.createOffer();
  myPeerConnection.setLocalDescription(offer);
  socket.emit("offer", offer, roomName);
});

socket.on("offer", async (offer) => {
  myPeerConnection.addEventListener("datachannel", (event) => {
    myDataChannel = event.channel;
    myDataChannel.addEventListener("message", handleGetMessage);
    myDataChannel.send("--상대방이 입장했습니다.--");
  });
  myPeerConnection.setRemoteDescription(offer);
  const answer = await myPeerConnection.createAnswer();
  myPeerConnection.setLocalDescription(answer);
  socket.emit("answer", answer, roomName);
});

socket.on("answer", (answer) => {
  myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", (ice) => {
  myPeerConnection.addIceCandidate(ice);
});

socket.on("bye", onPeerLeave);

// RTC Code

function handleSubmitChat(event) {
  event.preventDefault();
  if (!peerFace.srcObject) return;
  const li = document.createElement("li");
  li.innerText = chatInput.value;
  li.classList.add("me");
  messages.appendChild(li);
  li.scrollIntoView();
  myDataChannel.send(chatInput.value);
  chatInput.value = "";
}

function makeConnection() {
  myPeerConnection = new RTCPeerConnection({
    iceServers: [
      { urls: ["stun:hk-turn1.xirsys.com"] },
      {
        username:
          "v-Vn1AFObTJ460neBBQA8WBvkMDTd0w3iRXKjBY5EI8DODCmdbIgcRoPD0LbzpJqAAAAAGXzCO5nb3Jhbmk=",
        credential: "c19ec9ae-e20e-11ee-8ee2-0242ac120004",
        urls: [
          "turn:hk-turn1.xirsys.com:80?transport=udp",
          "turn:hk-turn1.xirsys.com:3478?transport=udp",
          "turn:hk-turn1.xirsys.com:80?transport=tcp",
          "turn:hk-turn1.xirsys.com:3478?transport=tcp",
          "turns:hk-turn1.xirsys.com:443?transport=tcp",
          "turns:hk-turn1.xirsys.com:5349?transport=tcp",
        ],
      },
    ],
  });
  chatForm.addEventListener("submit", handleSubmitChat);
  myPeerConnection.addEventListener("icecandidate", handleIce);
  myPeerConnection.addEventListener("addstream", handleAddStream);
  myStream
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));
}

function handleIce(data) {
  socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data) {
  peerFace = document.getElementById("peerFace");
  peerFace.srcObject = data.stream;
}

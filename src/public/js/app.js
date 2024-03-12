const socket = io();

const myVideo = document.getElementById("myVideo");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");

let myStream;
let muted = false;
let cameraOff = false;

async function getMedia() {
  try {
    myStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    myVideo.srcObject = myStream;
  } catch (e) {
    console.log(e);
  }
}

getMedia();

function handleMuteClick() {
  if (muted) {
    muteBtn.innerText = "Mute";
    muted = false;
  } else {
    muteBtn.innerText = "UnMute";
    muted = true;
  }
}
function handleCameraClick() {
  if (cameraOff) {
    cameraBtn.innerText = "Turn Camera Off";
    cameraOff = false;
  } else {
    cameraBtn.innerText = "Turn Camera On";
    cameraOff = true;
  }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

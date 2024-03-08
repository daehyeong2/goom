const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
  console.log("✅ Connected to Server");
});

socket.addEventListener("message", (message) => {
  console.log("📬 Got a message from Server:", message.data);
});

socket.addEventListener("close", () => {
  console.log("❌ Disconnected from Server");
});

setTimeout(() => {
  socket.send("Hello from the Browser!");
}, 1000);

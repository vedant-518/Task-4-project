const socket = io();
const params = new URLSearchParams(window.location.search);
const room = params.get("room");

socket.emit("join-room", room);

const video = document.getElementById("localVideo");
let stream;

async function startVideo() {
  stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  video.srcObject = stream;
}

// Screen Sharing
async function shareScreen() {
  const screen = await navigator.mediaDevices.getDisplayMedia({ video: true });
  video.srcObject = screen;
}

// Whiteboard
const board = document.getElementById("board");
const ctx = board.getContext("2d");

function toggleBoard() {
  board.style.display = board.style.display === "none" ? "block" : "none";
  board.width = 800;
  board.height = 400;
}

let drawing = false;
board.onmousedown = () => drawing = true;
board.onmouseup = () => drawing = false;
board.onmousemove = e => {
  if(!drawing) return;
  ctx.fillRect(e.offsetX, e.offsetY, 3, 3);
};
// FILE SHARING
const fileInput = document.getElementById("fileInput");
const filesDiv = document.getElementById("files");

function sendFile() {
  fileInput.click();
}

fileInput.onchange = () => {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    socket.emit("signal", {
      type: "file",
      name: file.name,
      data: reader.result
    });
  };
  reader.readAsDataURL(file);
};

socket.on("signal", data => {
  if (data.type === "file") {
    const link = document.createElement("a");
    link.href = data.data;
    link.download = data.name;
    link.innerText = `📥 Download ${data.name}`;
    link.style.display = "block";
    link.style.margin = "10px";
    filesDiv.appendChild(link);
  }
});
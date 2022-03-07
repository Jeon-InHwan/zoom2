import express from "express";
import http from "http";
// import { WebSocketServer } from "ws";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const PORT = process.env.PORT || 3000;
const app = express();

app.set("view engine", "pug");
app.set("views", process.cwd() + "/src/views");
app.use("/public", express.static(process.cwd() + "/src/public"));

app.get("/", (_, res) => res.render("home"));
app.get("/*", (_, res) => res.redirect("/"));

const handleListen = () =>
  console.log(`✅ Listening on https://localhost:${PORT} 🚀`);

const httpServer = http.createServer(app);

const socketIO_server = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
});

instrument(socketIO_server, {
  auth: false,
});

socketIO_server.on("connection", (socket) => {
  // joining the zoom event
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  // Sending offer to other brower
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  // receiving answer from other browser and send it to Brower A
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  // listening icecandidate event
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

/*

< This is the old way of making real-time features >

const wss = new WebSocketServer({ server });
const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anonymous";
  console.log("✅ Connected to Browser!");

  socket.on("close", () => console.log("❎ Disconnected from the Browser"));

  socket.on("message", (message) => {
    const parsedMsg = JSON.parse(message);

    switch (parsedMsg.type) {
      case "new_message":
        // when user write message
        sockets.forEach((aSocket) =>
          aSocket.send(`${socket.nickname} : ${parsedMsg.payload}`)
        );
        break;
      case "nickname":
        // when user write nickname
        socket["nickname"] = parsedMsg.payload;
        break;
    }
  });
});
*/

httpServer.listen(PORT, handleListen);

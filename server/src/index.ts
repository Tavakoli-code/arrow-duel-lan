import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";

import { registerGameSocket } from "./sockets/gameSocket.js";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "arrow-duel-lan-server",
  });
});

const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

io.on("connection", (socket) => {
  registerGameSocket(io, socket);
});

httpServer.listen(port, "0.0.0.0", () => {
  console.log(`Arrow Duel LAN server running on http://0.0.0.0:${port}`);
});

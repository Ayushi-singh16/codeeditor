const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/collabDB")
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error(err));

const DocSchema = new mongoose.Schema({
  _id: String,
  content: String
});
const Document = mongoose.model("Document", DocSchema);

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("get-document", async (docId) => {
    let document = await Document.findById(docId);
    if (!document) document = await Document.create({ _id: docId, content: "" });

    socket.join(docId);
    socket.emit("load-document", document.content);

    socket.on("send-changes", async (data) => {
      try {
        await Document.findByIdAndUpdate(docId, { content: data });
        io.to(docId).emit("receive-changes", data);
      } catch (err) {
        console.error("Error updating document:", err);
      }
    });
  });

  socket.on("disconnect", () => console.log("User disconnected:", socket.id));
});

server.listen(5001, () => console.log("✅ Backend running on port 5001"));
import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5001");

function App() {
  const [text, setText] = useState("");
  const docId = "123"; // same doc for all tabs

  useEffect(() => {
    socket.emit("get-document", docId);

    socket.on("load-document", (doc) => setText(doc));
    socket.on("receive-changes", (data) => setText(data));

    // Do NOT disconnect socket here
  }, []);

  const handleChange = (e) => setText(e.target.value);

  const handleSync = () => socket.emit("send-changes", text);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Collaborative Editor</h2>
      <textarea
        value={text}
        onChange={handleChange}
        rows="15"
        cols="80"
        style={{ width: "100%", fontSize: "16px" }}
      />
      <br />
      <button
        onClick={handleSync}
        style={{ marginTop: "10px", padding: "8px 16px", fontSize: "16px", cursor: "pointer" }}
      >
        Sync / Update
      </button>
    </div>
  );
}

export default App;
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const apiUrl = `https://api.telegram.org/bot${token}`;
let entries = [];

app.post("/", async (req, res) => {
  const data = req.body;
  const chatId = data.message.chat.id;
  const text = data.message.text;

  if (text.startsWith("/join")) {
    const uid = text.split(" ")[1];
    if (!uid) return send(chatId, "Send like: /join 12345");
    if (!entries.includes(uid)) entries.push(uid);
    send(chatId, `✅ UID ${uid} joined! Total entries: ${entries.length}`);
  }

  if (text === "/winner") {
    if (entries.length === 0) return send(chatId, "No entries yet!");
    const winner = entries[Math.floor(Math.random() * entries.length)];
    send(chatId, `🎉 Winner UID: *${winner}*`);
    entries = [];
    send(chatId, "✅ Entries reset!");
  }

  if (text === "/entries") {
    send(chatId, `Entries:\n${entries.join("\n") || "None"}`);
  }

  res.sendStatus(200);
});

async function send(id, msg) {
  await fetch(`${apiUrl}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: id, text: msg, parse_mode: "Markdown" }),
  });
}

app.listen(3000, () => console.log("Bot running"));

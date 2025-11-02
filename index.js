import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const apiUrl = `https://api.telegram.org/bot${token}`;
let entries = [];

// ✅ Telegram webhook route
app.post(`/${token}`, async (req, res) => {
  const data = req.body;

  if (!data.message) return res.sendStatus(200);

  const chatId = data.message.chat.id;
  const text = data.message.text || "";

  // ✅ Start command
  if (text === "/start") {
    return send(chatId, "Welcome! 🎉\nUse /join UID to enter.\nExample: /join 12345");
  }

  if (text.startsWith("/join")) {
    const uid = text.split(" ")[1];
    if (!uid) return send(chatId, "Send like: /join 12345");
    if (!entries.includes(uid)) entries.push(uid);
    return send(chatId, `✅ UID *${uid}* joined!\nTotal entries: ${entries.length}`);
  }

  if (text === "/winner") {
    if (entries.length === 0) return send(chatId, "No entries yet!");
    const winner = entries[Math.floor(Math.random() * entries.length)];
    entries = [];
    return send(chatId, `🎉 Winner UID: *${winner}*\n✅ New round started!`);
  }

  if (text === "/entries") {
    return send(chatId, `Current entries:\n${entries.join("\n") || "None yet"}`);
  }

  res.sendStatus(200);
});

// ✅ Send message fn
async function send(id, msg) {
  await fetch(`${apiUrl}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: id, text: msg, parse_mode: "Markdown" }),
  });
}

// ✅ Home route test
app.get("/", (req, res) => {
  res.send("Bot Live ✅");
});

// ✅ Server port
app.listen(3000, () => console.log("Bot running ✅"));

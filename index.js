import express from "express";
import axios from "axios";

const app = express();
app.use(express.json());

const TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const WEBHOOK_URL = process.env.RENDER_EXTERNAL_URL; // Render auto URL

let entries = [];

// Send message function
const send = async (chatId, text) => {
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text,
  });
};

// Receive updates from Telegram
app.post("/", async (req, res) => {
  console.log("Webhook hit:", req.body);

  if (!req.body.message) return res.sendStatus(200);

  const chatId = req.body.message.chat.id;
  const text = req.body.message.text?.trim();

  // /start command
  if (text === "/start") {
    return send(chatId, `🎯 *Raffle Bot Activated!*

Commands:
/join <UID> — Join raffle
/entries — Show all entries
/winner — Pick random winner
`, { parse_mode: "Markdown" });
  }

  // /join command
  if (text.startsWith("/join")) {
    const uid = text.split(" ")[1];

    if (!uid) return send(chatId, "❌ Format: /join 12345");
    if (entries.includes(uid)) return send(chatId, "⚠️ UID already joined");

    entries.push(uid);
    return send(chatId, `✅ UID *${uid}* added.\nTotal entries: ${entries.length}`);
  }

  // /entries command
  if (text === "/entries") {
    if (!entries.length) return send(chatId, "📭 No entries yet.");
    return send(chatId, `📌 Entries:\n${entries.join("\n")}`);
  }

  // /winner command
  if (text === "/winner") {
    if (!entries.length) return send(chatId, "❌ No entries to choose from.");
    
    const winner = entries[Math.floor(Math.random() * entries.length)];
    return send(chatId, `🏆 Winner UID: *${winner}* 🎉`);
  }

  res.sendStatus(200);
});

// Set webhook on start
app.get("/", async (_, res) => {
  try {
    await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    return res.send("✅ Webhook set successfully!");
  } catch (e) {
    console.error(e);
    return res.send("❌ Webhook error");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Bot running on ${PORT}`));

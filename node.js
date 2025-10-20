import fetch from "node-fetch";

const BOT_TOKEN = "8028942186:AAHbloJnS0H4LhmVA3Q1hpoyJ5VtETvthqY";
const API_URL = `https://api.telegram.org/bot${BOT_TOKEN}`;
const LIKE_API = "https://likes-by-dugu-yfkl.vercel.app/like";
const ALLOWED_GROUP_ID = -1003089918721;

const REQUIRED_CHANNELS = [
  "@owner_of_this_all",
  "@freefirelkies",
  "https://t.me/+KIFczlOSbYc5OWE9",
  "https://t.me/+kYroGKs753I4Njc1"
];

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(200).send("✅ Bot is live on Vercel!");

  const update = req.body;
  if (!update.message) return res.status(200).end();

  const chatId = update.message.chat.id;
  const userId = update.message.from.id;
  const text = (update.message.text || "").trim();

  // Only allow bot in your specific group
  if (chatId !== ALLOWED_GROUP_ID) {
    await sendMessage(chatId, "❌ This bot only works in the official group!");
    return res.status(200).end();
  }

  // Check if user joined all required channels
  for (const channel of REQUIRED_CHANNELS) {
    if (channel.startsWith("https://t.me/+")) continue;
    const resCheck = await fetch(`${API_URL}/getChatMember?chat_id=${channel}&user_id=${userId}`);
    const data = await resCheck.json();
    const status = data?.result?.status || "";
    if (!["member", "administrator", "creator"].includes(status)) {
      await sendMessage(
        chatId,
        `⚠️ You must join all these channels first:\n\n${REQUIRED_CHANNELS.join("\n")}`
      );
      return res.status(200).end();
    }
  }

  // Handle commands
  if (text === "/start") {
    await sendMessage(chatId, "👋 Welcome! Send your Free Fire UID to get likes instantly 🔥");
  } else if (/^\d+$/.test(text)) {
    const uid = text;
    const server = "ind";
    const apiRes = await fetch(`${LIKE_API}?uid=${uid}&server_name=${server}`);
    const likeText = await apiRes.text();
    await sendMessage(chatId, `✅ Likes requested for UID: ${uid}\n\n📡 API Response:\n${likeText}`);
  } else {
    await sendMessage(chatId, "📩 Please send your Free Fire UID!");
  }

  res.status(200).end();
}

async function sendMessage(chatId, text) {
  await fetch(`${API_URL}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text })
  });
}
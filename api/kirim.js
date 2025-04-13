import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  try {
    const { image } = req.body;
    const botToken = "8075080156:AAFhn7Wqxr-cxpvlSKdEFr1iL6qdOgWGwgw";
    const chatId = "6676770258"; // ID kamu sendiri

    const imageBuffer = Buffer.from(image.split(",")[1], "base64");

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", imageBuffer, "photo.jpg");

    const telegram = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    const result = await telegram.json();
    console.log(result);
    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("Gagal kirim ke Telegram:", error);
    res.status(500).json({ success: false });
  }
}

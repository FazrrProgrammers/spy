import fetch from "node-fetch";
import FormData from "form-data";

export default async function handler(req, res) {
  try {
    const { image } = req.body;
    const botToken = "8075080156:AAFhn7Wqxr-cxpvlSKdEFr1iL6qdOgWGwgw";
    const chatId = "6676770258";

    // Convert base64 image ke buffer
    const imageBuffer = Buffer.from(image.split(",")[1], "base64");

    // Siapkan form-data
    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", imageBuffer, { filename: "photo.jpg" });

    // Kirim ke Telegram
    const tg = await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
      method: "POST",
      body: form,
      headers: form.getHeaders(),
    });

    const tgRes = await tg.json();
    console.log(tgRes);

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal kirim foto ke Telegram" });
  }
}

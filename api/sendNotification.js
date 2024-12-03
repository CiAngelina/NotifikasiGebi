const http = require("http");
const admin = require("firebase-admin");

// Inisialisasi Firebase Admin SDK
const serviceAccount = require("../fir-push-notification-bfcaf-firebase-adminsdk-51ul4-a90a9c4e6b.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Fungsi untuk mengirim notifikasi
const sendNotification = async (devtok, title, body = {}) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: devtok, // Token perangkat
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Notifikasi berhasil dikirim:", response);
    return { success: true, response: response };
  } catch (error) {
    console.error("Gagal mengirim notifikasi:", error);
    return { success: false, error: error.message };
  }
};

// Membuat server HTTP
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/send-notification") {
    let body = "";

    // Menangani data POST
    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", async () => {
      try {
        const { token, title, bodyMessage, data } = JSON.parse(body);

        if (!token || !title || !bodyMessage) {
          res.writeHead(400, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Token, title, and body are required." }));
          return;
        }

        // Mengirim notifikasi
        const result = await sendNotification(token, title, bodyMessage, data || {});

        if (result.success) {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Notification sent successfully.", response: result.response }));
        } else {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Failed to send notification.", error: result.error }));
        }
      } catch (error) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ message: "Invalid JSON format.", error: error.message }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ message: "Route not found." }));
  }
});

// Menjalankan server di port 3000
const PORT = 3040;
server.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Kullanıcı Bağlandı: ${socket.id}`);

  // 1. Odaya Katılma (Burada socket.join ÇOK ÖNEMLİ)
  socket.on("join_room", (data) => {
    socket.join(data); 
    console.log(`Kullanıcı ID: ${socket.id} - Oda: ${data} odasına katıldı.`);
  });

  // 2. Mesaj Gönderme (Bu blok silinmişti, geri ekledik)
  socket.on("send_message", (data) => {
    console.log("Mesaj Geldi:", data); // Terminalde görmek için log
    // Mesajı gönderen hariç, odadaki diğer kişiye yolla
    socket.to(data.room).emit("receive_message", data);
  });

  // 3. Ayrılma
  socket.on("disconnect", () => {
    console.log("Kullanıcı Ayrıldı", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
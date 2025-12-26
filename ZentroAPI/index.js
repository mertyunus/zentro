const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const Message = require('./models/Message'); 
require('dotenv').config();

const app = express();
app.use(cors());

// --- VERİTABANI BAĞLANTISI ---
const dbURL = process.env.MONGO_URI;

mongoose.connect(dbURL)
  .then(() => console.log("✅ VERİTABANINA BAĞLANDI!"))
  .catch((err) => console.log("❌ Veritabanı Hatası:", err));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Kullanıcı Bağlandı: ${socket.id}`);

  // 1. Odaya Katılma ve ESKİ MESAJLARI YÜKLEME
  socket.on("join_room", (room) => {
    socket.join(room); 
    console.log(`Kullanıcı ID: ${socket.id} - Oda: ${room} odasına katıldı.`);

    // Veritabanından o odaya ait mesajları bul
    Message.find({ room: room }).then((messages) => {
      // Sadece odaya giren kişiye eski mesajları yolla
      socket.emit("load_old_messages", messages);
    });
  });

  // 2. Mesaj Gönderme ve KAYDETME
  socket.on("send_message", (data) => {
    // Önce veritabanına kaydet
    const messageToSave = new Message(data);
    
    messageToSave.save().then(() => {
      // Kayıt başarılıysa diğerlerine gönder
      socket.to(data.room).emit("receive_message", data);
    }).catch((err) => console.log("Mesaj kaydedilemedi:", err));
  });

  // 3. Yazıyor Sinyali
  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  socket.on("disconnect", () => {
    console.log("Kullanıcı Ayrıldı", socket.id);
  });
});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
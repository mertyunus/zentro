require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require("socket.io");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // Şifreleme için
const jwt = require('jsonwebtoken'); // Token (Bilet) için

const Message = require('./models/Message');
const User = require('./models/User'); // Yeni kullanıcı modelimiz

const app = express();

app.use(cors());
app.use(express.json()); // Gelen JSON verilerini okumak için şart!

// --- VERİTABANI BAĞLANTISI ---
const dbURL = process.env.MONGO_URI;

mongoose.connect(dbURL)
  .then(() => console.log("✅ VERİTABANINA BAĞLANDI!"))
  .catch((err) => console.log("❌ Veritabanı Hatası:", err));

// --- AUTH (KİMLİK) İŞLEMLERİ ---

// 1. KAYIT OLMA (REGISTER)
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcı zaten var mı?
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Bu kullanıcı adı zaten alınmış." });
    }

    // Şifreyi kriptola (Hash)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Yeni kullanıcıyı oluştur
    const newUser = new User({
      username,
      password: hashedPassword
    });

    await newUser.save();
    res.status(201).json({ message: "Kullanıcı başarıyla oluşturuldu!" });

  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});

// 2. GİRİŞ YAPMA (LOGIN)
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Kullanıcı bulunamadı!" });
    }

    // Şifreyi kontrol et (Hash'li şifre ile girilen şifreyi kıyasla)
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Şifre yanlış!" });
    }

    // Giriş başarılı! Ona dijital bir bilet (Token) verelim
    const token = jwt.sign({ id: user._id, username: user.username }, "GIZLI_KELIME", { expiresIn: "1h" });

    res.json({ token, username: user.username, userId: user._id });

    app.get('/users/:currentUserId', async (req, res) => {
      try {
        const currentUserId = req.params.currentUserId;
        // Kendisi hariç ($ne: not equal) tüm kullanıcıları bul, sadece username ve _id getir
        const users = await User.find({ _id: { $ne: currentUserId } }).select("username _id");
        res.json(users);
      } catch (error) {
        res.status(500).json({ message: "Kullanıcılar alınamadı" });
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Sunucu hatası" });
  }
});


// --- SOCKET.IO SUNUCUSU ---
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`Kullanıcı Bağlandı: ${socket.id}`);

  socket.on("join_room", (room) => {
    socket.join(room);
    Message.find({ room: room }).then((messages) => {
      socket.emit("load_old_messages", messages);
    });
  });

  socket.on("send_message", (data) => {
    const messageToSave = new Message(data);
    messageToSave.save().then(() => {
      socket.to(data.room).emit("receive_message", data);
    });
  });

  socket.on("typing", (data) => {
    socket.to(data.room).emit("display_typing", data);
  });

  socket.on("mark_as_read", async ({ room, user }) => {
    try {
      await Message.updateMany(
        { room: room, author: { $ne: user }, isRead: false },
        { $set: { isRead: true } }
      );
      io.to(room).emit("messages_read_update");
      
    } catch (error) {
      console.log("Okundu hatası:", error);
    }
  });


});

server.listen(3001, () => {
  console.log("SERVER RUNNING ON PORT 3001");
});
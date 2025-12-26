const mongoose = require('mongoose');

// Mesajın kalıbını çıkarıyoruz
const MessageSchema = new mongoose.Schema({
  room: String,
  author: String,
  message: String,
  time: String,
});

module.exports = mongoose.model("Message", MessageSchema);
import React, { useState } from 'react';
import axios from 'axios';

function Register({ onSwitch }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    try {
      // Backend'deki /register adresine istek atıyoruz
      await axios.post("http://localhost:3001/register", {
        username,
        password
      });
      alert("Kayıt Başarılı! Şimdi giriş yapabilirsin.");
      onSwitch("login"); // Başarılı olunca Login ekranına geç
    } catch (error) {
      alert("Kayıt Hatası: " + (error.response?.data?.message || "Sunucu hatası"));
    }
  };

  return (
    <div className="auth-container">
      <h2>Zentro'ya Kayıt Ol 📝</h2>
      <input 
        type="text" 
        placeholder="Kullanıcı Adı" 
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="Şifre" 
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={handleRegister}>Kayıt Ol</button>
      <p onClick={() => onSwitch("login")} className="toggle-text">
        Zaten hesabın var mı? <b>Giriş Yap</b>
      </p>
    </div>
  );
}

export default Register;
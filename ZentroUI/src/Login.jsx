import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin, onSwitch }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async () => {
        try {
            // Backend'e giriş isteği
            const response = await axios.post("http://localhost:3001/login", {
                username,
                password
            });

            const { token, username: user, userId } = response.data; // userId'yi de çektik
            onLogin(token, user, userId); // Üçünü de yolluyoruz
        } catch (error) {
            alert("Giriş Hatası: " + (error.response?.data?.message || "Bilinmeyen hata"));
        }
    };

    return (
        <div className="auth-container">
            <h2>Zentro'ya Giriş Yap 🔐</h2>
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
            <button onClick={handleLogin}>Giriş Yap</button>
            <p onClick={() => onSwitch("register")} className="toggle-text">
                Hesabın yok mu? <b>Kayıt Ol</b>
            </p>
        </div>
    );
}

export default Login;
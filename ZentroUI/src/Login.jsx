import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Lock, ArrowRight, MessageCircle, Send, Smile, ImageIcon, Phone } from 'lucide-react';
// import './App.css'; // Tasarım dosyasını çağırıyoruz

// --- Yüzen Arka Plan Mesajları Bileşeni ---
const FloatingMessages = () => {
    const messages = [
        { icon: MessageCircle, text: "Merhaba!", delay: 0, x: "10%", y: "20%" },
        { icon: Send, text: "Nasılsın?", delay: 2, x: "80%", y: "15%" },
        { icon: Smile, text: "Harika!", delay: 4, x: "15%", y: "70%" },
        { icon: ImageIcon, text: "Fotoğraf paylaş", delay: 1, x: "75%", y: "65%" },
        { icon: Phone, text: "Görüntülü ara", delay: 3, x: "20%", y: "45%" },
        { icon: MessageCircle, text: "Zentro'da bağlan", delay: 5, x: "70%", y: "40%" },
    ];

    return (
        <div className="floating-container">
            {messages.map((msg, index) => {
                const Icon = msg.icon;
                return (
                    <div
                        key={index}
                        className="floating-item"
                        style={{
                            left: msg.x,
                            top: msg.y,
                            animationDelay: `${msg.delay}s`,
                        }}
                    >
                        <div className="message-bubble">
                            <Icon size={20} color="white" />
                            <span>{msg.text}</span>
                        </div>
                    </div>
                );
            })}
            {/* Arka plan renk topları */}
            <div className="glow-circle purple"></div>
            <div className="glow-circle pink"></div>
        </div>
    );
};

// --- Ana Login Bileşeni ---
function Login({ onLogin, onSwitch }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e) => {
        if (e) e.preventDefault(); // Form submit olayını durdur
        
        if (username === "" || password === "") {
            alert("Lütfen tüm alanları doldurun!");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axios.post("http://localhost:3001/login", {
                username,
                password
            });

            const { token, username: user, userId } = response.data;
            onLogin(token, user, userId);
        } catch (error) {
            alert("Giriş Hatası: " + (error.response?.data?.message || "Sunucuya ulaşılamadı."));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <FloatingMessages />

            <div className="brand-header">
                <h1>zentro</h1>
                <p>Sohbetleriniz için yeni bir merkez</p>
            </div>

            <div className="login-card-wrapper">
                <div className="glow-effect"></div>
                
                <div className="login-card">
                    <div className="card-header">
                        <div className="logo-icon">
                            <span>💬</span>
                        </div>
                        <h2>Tekrar Hoş Geldiniz</h2>
                        <p>Sohbetlerinize devam edin</p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form">
                        <div className="input-group">
                            <label htmlFor="username">Kullanıcı Adı</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    id="username"
                                    type="text"
                                    placeholder="kullaniciadi"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Şifre</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button 
                                type="submit" 
                                className="submit-btn" 
                                disabled={isLoading}
                            >
                                <span>{isLoading ? "Giriş Yapılıyor..." : "Giriş Yap"}</span>
                                {!isLoading && <ArrowRight size={20} />}
                            </button>

                            <button
                                type="button"
                                className="switch-btn"
                                onClick={() => onSwitch("register")}
                            >
                                Hesabınız yok mu? <b>Kayıt olun</b>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="bottom-fade"></div>
        </div>
    );
}

export default Login;
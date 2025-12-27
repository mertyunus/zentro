import React, { useState } from 'react';
import axios from 'axios';
import { User, Lock, ArrowRight, MessageCircle, Send, Smile, ImageIcon, Phone } from 'lucide-react';
import './Login.css'; // Aynı CSS dosyasını kullanıyoruz, tasarımı bozmadan!

// --- Yüzen Arka Plan Mesajları (Login ile aynı atmosferi korumak için) ---
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
            <div className="glow-circle purple"></div>
            <div className="glow-circle pink"></div>
        </div>
    );
};

// --- Ana Register Bileşeni ---
function Register({ onSwitch }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleRegister = async (e) => {
        if (e) e.preventDefault();
        
        if (username === "" || password === "") {
            alert("Lütfen bir kullanıcı adı ve şifre belirleyin!");
            return;
        }

        setIsLoading(true);
        try {
            // Backend'de "/register" endpoint'i olduğunu varsayıyoruz
            await axios.post("http://localhost:3001/register", {
                username,
                password
            });

            alert("Kayıt Başarılı! 🎉 Şimdi giriş yapabilirsin.");
            onSwitch("login"); // Kayıt bitince otomatik Giriş ekranına at
        } catch (error) {
            alert("Kayıt Hatası: " + (error.response?.data?.message || "Sunucu hatası"));
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
                        <div className="logo-icon" style={{ background: 'linear-gradient(135deg, #10b981, #06b6d4)' }}>
                            {/* Kayıt ekranı olduğu belli olsun diye rengi hafif değiştirdik (Yeşil tonu) */}
                            <span>🚀</span>
                        </div>
                        <h2>Zentro'ya Katılın</h2>
                        <p>Yeni bir sohbet deneyimi</p>
                    </div>

                    <form onSubmit={handleRegister} className="login-form">
                        <div className="input-group">
                            <label htmlFor="reg-username">Kullanıcı Adı Seçin</label>
                            <div className="input-wrapper">
                                <User className="input-icon" size={20} />
                                <input
                                    id="reg-username"
                                    type="text"
                                    placeholder="Yeni kullanıcı adınız"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="input-group">
                            <label htmlFor="reg-password">Şifre Belirleyin</label>
                            <div className="input-wrapper">
                                <Lock className="input-icon" size={20} />
                                <input
                                    id="reg-password"
                                    type="password"
                                    placeholder="Güçlü bir şifre"
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
                                style={{ background: 'linear-gradient(to right, #10b981, #06b6d4)' }} // Buton rengi de uyumlu olsun
                            >
                                <span>{isLoading ? "Kaydediliyor..." : "Kayıt Ol"}</span>
                                {!isLoading && <ArrowRight size={20} />}
                            </button>

                            <button
                                type="button"
                                className="switch-btn"
                                onClick={() => onSwitch("login")}
                            >
                                Zaten hesabınız var mı? <b>Giriş yapın</b>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            <div className="bottom-fade"></div>
        </div>
    );
}

export default Register;
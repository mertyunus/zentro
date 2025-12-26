import { useState } from 'react';
import './App.css';
import io from 'socket.io-client';
import Chat from './Chat';
import Login from './Login';
import Register from './Register';

// Socket bağlantısını şimdilik burada başlatıyoruz
const socket = io.connect("http://localhost:3001");

function App() {
  const [user, setUser] = useState(null); // Giriş yapmış kullanıcı bilgisi
  const [token, setToken] = useState(null); // Giriş bileti
  const [currentScreen, setCurrentScreen] = useState("login"); // login, register, chat
  const [room, setRoom] = useState("");
  const [isInChat, setIsInChat] = useState(false);

  // Kullanıcı başarıyla giriş yapınca çalışır
  const handleLoginSuccess = (token, username) => {
    setToken(token);
    setUser(username);
    setCurrentScreen("room_select"); // Oda seçmeye gönder
  };

  // Odaya katıl butonuna basınca
  const joinRoom = () => {
    if (user && room !== "") {
      const odaID = String(room);
      socket.emit("join_room", odaID);
      setIsInChat(true); // Sohbeti aç
    }
  };

  // Çıkış yapma fonksiyonu
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsInChat(false);
    setCurrentScreen("login");
  };

  return (
    <div className="App">
      
      {/* 1. KULLANICI GİRİŞ YAPMAMIŞSA */}
      {!user && (
        <>
          {currentScreen === "login" ? (
            <Login onLogin={handleLoginSuccess} onSwitch={setCurrentScreen} />
          ) : (
            <Register onSwitch={setCurrentScreen} />
          )}
        </>
      )}

      {/* 2. GİRİŞ YAPMIŞ AMA HENÜZ ODAYA GİRMEMİŞSE */}
      {user && !isInChat && (
        <div className="joinChatContainer">
          <h3>Hoşgeldin, {user}! 👋</h3>
          <p>Hangi odaya girmek istersin?</p>
          <input 
            type="text" 
            placeholder="Oda ID..." 
            onChange={(event) => setRoom(event.target.value)}
          />
          <button onClick={joinRoom}>Odaya Katıl</button>
          <button onClick={logout} style={{backgroundColor: '#d32f2f', marginTop: '10px'}}>Çıkış Yap</button>
        </div>
      )}

      {/* 3. SOHBET EKRANI */}
      {user && isInChat && (
        <>
          <Chat socket={socket} username={user} room={room} />
          <button className="back-btn" onClick={() => setIsInChat(false)}>Odadan Çık</button>
        </>
      )}

    </div>
  );
}

export default App;
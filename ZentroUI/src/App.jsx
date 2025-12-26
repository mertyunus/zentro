import { useState } from 'react';
import './App.css';
import io from 'socket.io-client';
import Chat from './Chat';
import Login from './Login';
import Register from './Register';
import Sidebar from './Sidebar';

const socket = io.connect("http://localhost:3001");

function App() {
  // currentUser artık bir obje: { username: "ali", userId: "123..." }
  const [currentUser, setCurrentUser] = useState(null); 
  const [token, setToken] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("login");
  
  // Seçilen sohbet arkadaşı
  const [selectedUser, setSelectedUser] = useState(null);
  const [room, setRoom] = useState("");

  const handleLoginSuccess = (token, username, userId) => {
    setToken(token);
    setCurrentUser({ username, userId }); // Tüm bilgileri sakla
    setCurrentScreen("chat_interface");
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setSelectedUser(null);
    setCurrentScreen("login");
  };

  // Bir kullanıcıya tıklayınca çalışır
  const startChat = (otherUser) => {
    setSelectedUser(otherUser);

    // --- ÖZEL ODA ALGORİTMASI ---
    // Ali (ID: 10) ve Veli (ID: 20) konuşurken oda ID hep aynı olmalı.
    // Çözüm: ID'leri alfabetik sıraya dizip birleştir.
    // Oda ID: "10_20" (Ali de tıklasa, Veli de tıklasa sonuç aynı olur)
    
    const ids = [currentUser.userId, otherUser._id].sort();
    const newRoomID = ids.join("_");
    
    setRoom(newRoomID);
    socket.emit("join_room", newRoomID);
  };

  return (
    <div className="App">
      
      {!currentUser ? (
        currentScreen === "login" ? (
          <Login onLogin={handleLoginSuccess} onSwitch={setCurrentScreen} />
        ) : (
          <Register onSwitch={setCurrentScreen} />
        )
      ) : (
        // GİRİŞ YAPILMIŞ EKRAN (WhatsApp Tasarımı)
        <div className="main-container">
          
          {/* SOL TARA (Kişi Listesi) */}
          <div className="sidebar-container">
            <Sidebar 
              currentUser={currentUser} 
              onSelectUser={startChat} 
              onLogout={logout} 
              selectedUser={selectedUser}
            />
          </div>

          {/* SAĞ TARAF (Sohbet) */}
          <div className="chat-area">
            {selectedUser ? (
              <Chat socket={socket} username={currentUser.username} room={room} />
            ) : (
              <div className="welcome-screen">
                <h3>Zentro'ya Hoşgeldin! 👋</h3>
                <p>Mesajlaşmak için soldan bir kişi seç.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}

export default App;
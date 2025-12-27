import { useState, useEffect } from 'react'; // 1. useEffect eklendi
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

  // --- YENİ EKLENEN KISIM: Sayfa Yüklendiğinde Kontrol ---
  useEffect(() => {
    // Tarayıcı hafızasına bak
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      // Hafızada varsa state'i güncelle (Oturumu aç)
      setToken(storedToken);
      setCurrentUser(JSON.parse(storedUser)); // String'i objeye çeviriyoruz
      setCurrentScreen("chat_interface");
    }
  }, []); // Boş [] olduğu için sadece sayfa ilk açıldığında (veya F5'te) çalışır

  const handleLoginSuccess = (token, username, userId) => {
    // 1. State'i güncelle
    setToken(token);
    const userData = { username, userId };
    setCurrentUser(userData); 
    setCurrentScreen("chat_interface");

    // 2. YENİ EKLENEN KISIM: Tarayıcı hafızasına kaydet
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData)); // Objeyi string'e çevirip saklıyoruz
  };

  const logout = () => {
    // 1. State'i temizle
    setCurrentUser(null);
    setToken(null);
    setSelectedUser(null);
    setCurrentScreen("login");

    // 2. YENİ EKLENEN KISIM: Tarayıcı hafızasını temizle
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  // Bir kullanıcıya tıklayınca çalışır
  const startChat = (otherUser) => {
    setSelectedUser(otherUser);

    // --- ÖZEL ODA ALGORİTMASI ---
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
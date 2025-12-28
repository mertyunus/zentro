import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './Login';
import Register from './Register';
import Chat from './Chat';
import Sidebar from './Sidebar';
import './App.css';

const socket = io.connect("http://localhost:3001");

function App() {
  // 1. KRİTİK DEĞİŞİKLİK: State'i null ile başlatmak yerine DİREKT LocalStorage'dan okuyoruz.
  // Bu sayede sayfa yenilense bile token ilk andan itibaren dolu geliyor.
  const [token, setToken] = useState(localStorage.getItem("token")); 
  
  // Kullanıcı verisini de aynı şekilde çekiyoruz
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUsername = localStorage.getItem("username");
    const savedUserId = localStorage.getItem("userId");
    
    // Eğer ikisi de varsa objeyi oluştur, yoksa null olsun
    if (savedUsername && savedUserId) {
        return { username: savedUsername, userId: savedUserId };
    }
    return null;
  });

  const [currentScreen, setCurrentScreen] = useState("login");
  const [room, setRoom] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (token && currentUser) {
    }
  }, [token, currentUser]);


  const loginHandler = (token, username, userId) => {
    setToken(token);
    setCurrentUser({ username, userId });
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    localStorage.setItem("userId", userId);
  };

  const logoutHandler = () => {
    setToken(null);
    setCurrentUser(null);
    setSelectedUser(null);
    setRoom("");
    setCurrentScreen("login");
    
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("userId");
  };

  const startChat = (user) => {
    setSelectedUser(user);
    const sortedIds = [currentUser.userId, user._id].sort();
    const roomId = sortedIds.join("_");
    setRoom(roomId);
  };

  if (!token) {
    return (
      <div className="App">
        {currentScreen === "login" ? (
          <Login onLogin={loginHandler} onSwitch={() => setCurrentScreen("register")} />
        ) : (
          <Register onSwitch={() => setCurrentScreen("login")} />
        )}
      </div>
    );
  }

  return (
    <div className="App">
      <div className="main-container">
        <div className="sidebar-container">
            <Sidebar 
                currentUser={currentUser} 
                onSelectUser={startChat} 
                onLogout={logoutHandler}
                selectedUser={selectedUser}
            />
        </div>
        <div className="chat-area">
            {room ? (
                <Chat 
                    socket={socket} 
                    username={currentUser.username} 
                    room={room}
                    selectedUser={selectedUser} 
                />
            ) : (
                <div className="welcome-screen">
                    <h3>Zentro'ya Hoşgeldin! 👋</h3>
                    <p>Mesajlaşmak için soldan bir kişi seç.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default App;
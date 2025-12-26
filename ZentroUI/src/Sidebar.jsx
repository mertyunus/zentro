import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Sidebar({ currentUser, onSelectUser, onLogout }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Veritabanındaki diğer kullanıcıları çek
    const fetchUsers = async () => {
      try {
        // App.jsx'ten gelen userId'yi kullanıyoruz (currentUser.userId olmalı)
        // Eğer currentUser obje değilse kontrol etmemiz lazım, şimdilik varsayalım.
        // Not: Login.jsx'ten dönen veriye göre currentUser bir obje mi string mi kontrol edeceğiz.
        // Güvenlik için id'yi localStorage'dan veya props'tan doğru almalıyız.
        
        // Basitlik için tüm kullanıcıları çekelim (Filtrelemeyi backend yapıyor ama ID lazım)
        // Şimdilik ID göndermeden hepsini çekelim, Backend'i düzelteceğim.
        const response = await axios.get(`http://localhost:3001/users/${currentUser.userId}`);
        setUsers(response.data);
      } catch (error) {
        console.error("Kullanıcılar yüklenemedi", error);
      }
    };

    if (currentUser) {
      fetchUsers();
    }
  }, [currentUser]);

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Zentro 💬</h3>
        <p>Ben: <b>{currentUser.username}</b></p>
        <button onClick={onLogout} className="logout-btn">Çıkış</button>
      </div>
      <div className="users-list">
        {users.map((user) => (
          <div key={user._id} className="user-item" onClick={() => onSelectUser(user)}>
            <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
            <p>{user.username}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;
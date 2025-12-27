import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search } from 'lucide-react'; // İkon paketini unutma

// Kullanıcı ismine göre rastgele ama sabit renk üreten fonksiyon
// (Görsel zenginlik için ekledim, mantığı bozmaz)
const getColor = (username) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    let hash = 0;
    if (!username) return colors[0];
    for (let i = 0; i < username.length; i++) {
        hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
};

function Sidebar({ currentUser, onSelectUser, onLogout, selectedUser }) {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Arama filtresi için state

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // SENİN MEVCUT AXIOS İSTEĞİN (HİÇ DOKUNMADIM)
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

  // Frontend tarafında filtreleme (Backend'e yük olmamak için)
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="sidebar">
      {/* HEADER KISMI (Modern Tasarım) */}
      <div className="sidebar-header">
        <h1 className="app-title">Mesajlar</h1>
        
        {/* Arama Çubuğu */}
        <div className="search-container">
          <Search className="search-icon" size={18} />
          <input 
            type="text" 
            placeholder="Kullanıcı ara..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* KULLANICI LİSTESİ */}
      <div className="user-list">
        {filteredUsers.map((user) => (
          <div 
            key={user._id} 
            // Aktif kullanıcı seçimi mantığını koruduk
            className={`user-item ${selectedUser && selectedUser._id === user._id ? "active" : ""}`} 
            onClick={() => onSelectUser(user)}
          >
            {/* Avatar Kısmı (Daha şık hali) */}
            <div 
                className="avatar-circle" 
                style={{ background: getColor(user.username) }}
            >
                {/* İsim baş harflerini gösterir (Örn: Yunus -> YU) */}
                {user.username.substring(0,2).toUpperCase()}
            </div>

            <div className="user-info">
                <div className="user-row-top">
                  <span className="username">{user.username}</span>
                  {/* Buraya istersen son görülme saati vb. ekleyebilirsin */}
                </div>
                <div className="user-row-bottom">
                  <p className="last-message">Sohbeti başlatmak için tıkla...</p>
                </div>
            </div>
          </div>
        ))}

        {/* Liste boşsa uyarı */}
        {filteredUsers.length === 0 && (
            <div style={{padding: '20px', textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem'}}>
                Kullanıcı bulunamadı.
            </div>
        )}
      </div>

      {/* FOOTER (Profil ve Çıkış) */}
      <div className="sidebar-footer">
        <div className="current-user">
           {/* Senin Avatarın */}
           <div className="avatar-circle small" style={{ background: '#1e293b' }}>
              {currentUser?.username.substring(0,2).toUpperCase()}
           </div>
           <span>{currentUser?.username}</span>
        </div>
        <button onClick={onLogout} className="logout-btn">Çıkış</button>
      </div>
    </div>
  );
}

export default Sidebar;
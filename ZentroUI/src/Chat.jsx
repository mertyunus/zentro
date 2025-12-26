import React, { useEffect, useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react'; // 1. EMOJI KÜTÜPHANESİNİ ÇAĞIRDIK

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");

  // 2. EMOJI PANELİ AÇIK MI KAPALI MI KONTROLÜ
  const [showEmoji, setShowEmoji] = useState(false);

  const messagesEndRef = useRef(null);

  const sendMessage = async () => {
    if (currentMessage !== "") {
      const now = new Date();
      const messageData = {
        room: room,
        author: username,
        message: currentMessage,
        time: now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes(),
      };

      await socket.emit("send_message", messageData);
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setShowEmoji(false); // Mesaj gidince paneli kapat
    }
  };

  // 3. EMOJIYE TIKLAYINCA ÇALIŞAN FONKSİYON
  const onEmojiClick = (emojiObject) => {
    // Mevcut mesajın sonuna seçilen emojiyi ekle
    setCurrentMessage((prev) => prev + emojiObject.emoji);
    // Paneli kapatma, belki adam 3 tane emoji atacak :)
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);
    socket.emit("typing", { room: room, author: username });
  }

  useEffect(() => {
    // 1. EĞER BAĞLANTI KOPARSA DİYE OTOMATİK ODAYA GİRME EMRİ
    // Chat bileşeni her açıldığında veya room değiştiğinde odaya gir
    socket.emit("join_room", room);

    const messageHandler = (data) => {
      setMessageList((list) => [...list, data]);
      setTypingStatus("");

      if (data.author !== username) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log("Ses çalınamadı:", e));
        } catch (error) {
          console.log("Ses hatası");
        }

        if (document.hidden) {
          document.title = "🔔 (1) Yeni Mesaj!";
        }
      }
    };

    const typingHandler = (data) => {
      setTypingStatus(`${data.author} yazıyor...`);
      setTimeout(() => {
        setTypingStatus("");
      }, 3000);
    };

    // Eski mesajları veritabanından getiren fonksiyon
    const oldMessagesHandler = (data) => {
      setMessageList(data);
    };

    // --- BAĞLANTI KOPUP GELİRSE ---
    // Eğer internet giderse veya tarayıcı sekmeyi uyutursa, 
    // geri gelince "connect" olayı tetiklenir.
    const reconnectHandler = () => {
      console.log("Yeniden bağlanıldı, odaya tekrar giriliyor...");
      socket.emit("join_room", room);
    };

    socket.on("receive_message", messageHandler);
    socket.on("display_typing", typingHandler);
    socket.on("load_old_messages", oldMessagesHandler);
    socket.on("connect", reconnectHandler); // Yeniden bağlanma dinleyicisi

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        document.title = "Zentro Chat";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Karşı taraf mesajları okuyunca tetiklenir
    const readUpdateHandler = () => {
      // Basitçe: Veritabanından en güncel hali tekrar çekelim
      // (Daha optimize yolları var ama şimdilik en garantisi bu)
      socket.emit("join_room", room); 
    };

    socket.on("messages_read_update", readUpdateHandler);


    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("display_typing", typingHandler);
      socket.off("load_old_messages", oldMessagesHandler);
      socket.off("connect", reconnectHandler); // Temizlik
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, room]); // DİKKAT: Buraya 'room' da eklendi.

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, typingStatus]);

  useEffect(() => {
    if (messageList.length > 0) {
      socket.emit("mark_as_read", { room, user: username });
    }
  }, [messageList, room, username]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Sohbet: {room.replace(/_/g, " & ")}</p> {/* Oda ismini güzelleştirdik */}
      </div>
      <div className="chat-body">
       {messageList.map((messageContent, index) => {
          return (
            <div 
              key={index} 
              className="message-container" // Yeni sınıf
              id={username === messageContent.author ? "you" : "other"}
            >
              {/* Eğer mesaj başkasından geliyorsa avatarı sola koy */}
              {username !== messageContent.author && (
                 <img 
                   className="chat-avatar" 
                   src={`https://api.dicebear.com/7.x/bottts/svg?seed=${messageContent.author}`} 
                   alt="avatar"
                 />
              )}

              <div className="message">
                <div>
                  <div className="message-content">
                    <p style={{color: 'black', margin: 0}}>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author" style={{fontWeight: 'bold', marginLeft: '5px', marginRight: '5px'}}>{messageContent.author}</p>
                    
                    {/* YENİ: TİK İŞARETİ */}
                    {/* Sadece kendi mesajlarımda tik göster */}
                    {username === messageContent.author && (
                      <span className="tick-icon" style={{ 
                        color: messageContent.isRead ? '#34b7f1' : 'gray', // Okunduysa Mavi, değilse Gri
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {messageContent.isRead ? "✓✓" : "✓"} 
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          );
        })}
        {typingStatus && (
          <div className="typing-indicator" style={{ fontStyle: 'italic', color: '#555', padding: '5px 10px', fontSize: '12px' }}>
            {typingStatus}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        {/* 4. EMOJI BUTONU */}
        <button
          className="emoji-btn"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          😀
        </button>

        {/* 5. EMOJI PANELİ (Sadece showEmoji true ise görünür) */}
        {showEmoji && (
          <div className="emoji-picker-container">
            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
          </div>
        )}

        <input
          type="text"
          value={currentMessage}
          placeholder="Bir mesaj yazın..."
          onChange={handleTyping}
          onKeyPress={(event) => { event.key === "Enter" && sendMessage(); }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
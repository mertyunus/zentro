import React, { useEffect, useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react'; 

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);

  // Otomatik kaydırma için referans noktası
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
      setShowEmoji(false); 
    }
  };

  const onEmojiClick = (emojiObject) => {
    setCurrentMessage((prev) => prev + emojiObject.emoji);
  };

  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);
    socket.emit("typing", { room: room, author: username });
  }

  // --- 1. OTOMATİK KAYDIRMA (GÜNCELLENDİ) ---
  useEffect(() => {
    // Ufak bir gecikme (100ms) ekliyoruz. 
    // Bu sayede resimler/avatarlar yüklendikten sonra kaydırma yapılır.
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    return () => clearTimeout(timer);
  }, [messageList, typingStatus, showEmoji]); // Emoji paneli açılınca da kaydır

  useEffect(() => {
    // Odaya katılma ve olay dinleyicileri
    socket.emit("join_room", room);

    const messageHandler = (data) => {
      setMessageList((list) => [...list, data]);
      setTypingStatus("");

      if (data.author !== username) {
        try {
          const audio = new Audio('/notification.mp3');
          audio.play().catch(e => console.log("Ses çalınamadı:", e));
        } catch (error) { console.log("Ses hatası"); }

        if (document.hidden) {
          document.title = "🔔 (1) Yeni Mesaj!";
        }
      }
    };

    const typingHandler = (data) => {
      setTypingStatus(`${data.author} yazıyor...`);
      setTimeout(() => setTypingStatus(""), 3000);
    };

    const oldMessagesHandler = (data) => {
      setMessageList(data);
    };

    const reconnectHandler = () => {
      console.log("Yeniden bağlanıldı...");
      socket.emit("join_room", room);
    };

    const readUpdateHandler = () => {
      socket.emit("join_room", room); 
    };

    socket.on("receive_message", messageHandler);
    socket.on("display_typing", typingHandler);
    socket.on("load_old_messages", oldMessagesHandler);
    socket.on("connect", reconnectHandler);
    socket.on("messages_read_update", readUpdateHandler);

    const handleVisibilityChange = () => {
      if (!document.hidden) document.title = "Zentro Chat";
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("display_typing", typingHandler);
      socket.off("load_old_messages", oldMessagesHandler);
      socket.off("connect", reconnectHandler);
      socket.off("messages_read_update", readUpdateHandler);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, room, username]); 

  // Okundu bilgisi gönderme
  useEffect(() => {
    if (messageList.length > 0) {
      socket.emit("mark_as_read", { room, user: username });
    }
  }, [messageList, room, username]);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Sohbet: {room.replace(/_/g, " & ")}</p>
      </div>
      <div className="chat-body">
       {messageList.map((messageContent, index) => {
          return (
            <div 
              key={index} 
              className="message-container"
              id={username === messageContent.author ? "you" : "other"}
            >
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
                    <p id="author" style={{fontWeight: 'bold', margin: '0 5px'}}>{messageContent.author}</p>
                    
                    {username === messageContent.author && (
                      <span className="tick-icon" style={{ 
                        color: messageContent.isRead ? '#34b7f1' : 'gray',
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
        
        {/* BU GÖRÜNMEZ KUTU SAYESİNDE AŞAĞI KAYIYORUZ */}
        <div ref={messagesEndRef} />
      </div>

      <div className="chat-footer">
        <button
          className="emoji-btn"
          onClick={() => setShowEmoji(!showEmoji)}
        >
          😀
        </button>

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
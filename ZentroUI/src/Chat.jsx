import React, { useEffect, useState, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react'; 
import { Send, Phone, Video, Info, MoreVertical, Smile, Check, CheckCheck } from 'lucide-react'; 

const getColor = (str) => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    let hash = 0;
    if(!str) return colors[0];
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
};

function Chat({ socket, username, room, selectedUser }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
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
        isRead: false, // İlk çıkışta KESİNLİKLE false (Gri)
      };

      await socket.emit("send_message", messageData);
      
      // Mesajı listeye ekle (Burada isRead: false olarak ekleniyor)
      setMessageList((list) => [...list, messageData]);
      setCurrentMessage("");
      setShowEmoji(false); 
    }
  };

  const onEmojiClick = (emojiObject) => {
    setCurrentMessage((prev) => prev + emojiObject.emoji);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, showEmoji]);

  useEffect(() => {
    socket.emit("join_room", room);
    
    const messageHandler = (data) => {
        setMessageList((list) => [...list, data]);
        // Gelen mesaj başkasındansa ses çal
        if (data.author !== username) {
            try {
                const audio = new Audio('/notification.mp3'); 
                audio.play().catch(err => console.log("Ses hatası:", err));
            } catch (e) {}
        }
    };

    // Karşı taraf okuyunca tetiklenir: Listeyi güncelle
    const readUpdateHandler = () => {
         socket.emit("join_room", room); // Verileri tazelemek için en garanti yol
    };

    const oldMessagesHandler = (data) => setMessageList(data);

    socket.on("receive_message", messageHandler);
    socket.on("load_old_messages", oldMessagesHandler);
    socket.on("messages_read_update", readUpdateHandler); 

    return () => {
        socket.off("receive_message", messageHandler);
        socket.off("load_old_messages", oldMessagesHandler);
        socket.off("messages_read_update", readUpdateHandler);
    };
  }, [socket, room, username]);


  // --- AKILLI OKUNDU BİLGİSİ ---
  // Sadece sayfa aktifse ve yeni mesaj gelmişse "Okudum" diye bildir.
  useEffect(() => {
     const markReadIfActive = () => {
         if(messageList.length > 0) {
             const lastMsg = messageList[messageList.length - 1];
             
             // Son mesaj benim değilse VE sayfa görünür durumdaysa okundu yap
             if(lastMsg.author !== username && !document.hidden) {
                 socket.emit("mark_as_read", { room, user: username });
             }
         }
     };

     // 1. Yeni mesaj geldiğinde kontrol et
     markReadIfActive();

     // 2. Kullanıcı başka sekmeden bu sekmeye döndüğünde kontrol et
     const handleVisibilityChange = () => {
         if (!document.hidden) {
             markReadIfActive();
         }
     };

     document.addEventListener("visibilitychange", handleVisibilityChange);
     return () => document.removeEventListener("visibilitychange", handleVisibilityChange);

  }, [messageList, room, username]);

  const chatTitle = selectedUser ? selectedUser.username : room;

  return (
    <div className="chat-wrapper">
      <div className="chat-header">
        <div className="header-left">
           <div className="avatar-circle header-av" style={{ background: getColor(chatTitle) }}>
             {chatTitle.substring(0,2).toUpperCase()}
           </div>
           <div className="header-text">
             <h2>{chatTitle}</h2>
             <p>Çevrimiçi</p>
           </div>
        </div>
        <div className="header-actions">
           <Phone size={20} className="icon-btn"/>
           <Video size={20} className="icon-btn"/>
           <Info size={20} className="icon-btn"/>
           <MoreVertical size={20} className="icon-btn"/>
        </div>
      </div>

      <div className="messages-area">
        {messageList.map((msg, index) => {
          const isMe = username === msg.author;
          return (
            <div key={index} className={`message-row ${isMe ? 'me' : 'other'}`}>
               <div className={`bubble ${isMe ? 'bubble-me' : 'bubble-other'}`}>
                  <p className="msg-text">{msg.message}</p>
                  
                  <div className="msg-footer">
                      <span className={`msg-time ${isMe ? 'time-me' : 'time-other'}`}>{msg.time}</span>
                      
                      {isMe && (
                          <span className="tick-icon">
                              {/* Eğer isRead true ise Çift Mavi Tik, değilse Tek Gri Tik */}
                              {msg.isRead ? 
                                <CheckCheck size={16} color="#86efac" /> : 
                                <Check size={16} color="rgba(255,255,255,0.7)" />
                              }
                          </span>
                      )}
                  </div>

               </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
         {showEmoji && (
          <div className="emoji-popover">
            <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
          </div>
        )}
         <div className="input-container">
            <input 
              type="text" 
              placeholder="Bir mesaj yazın..." 
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && sendMessage()}
            />
            <Smile size={20} className="emoji-trigger" onClick={() => setShowEmoji(!showEmoji)} />
         </div>
         <button className="send-button" onClick={sendMessage}>
            
            <Send size={30} strokeWidth={2.5} style={{ marginLeft: '2px' }} /> 
         </button>
      </div>
    </div>
  );
}

export default Chat;
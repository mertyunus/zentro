import React, { useEffect, useState, useRef } from 'react';

function Chat({ socket, username, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  const [typingStatus, setTypingStatus] = useState(""); // Kim yazıyor bilgisini tutar
  
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
    }
  };

  // Klavyeye basıldığında çalışır
  const handleTyping = (e) => {
    setCurrentMessage(e.target.value);
    // Sunucuya "Ben yazıyorum" de
    socket.emit("typing", { room: room, author: username });
  }

  useEffect(() => {
    const messageHandler = (data) => {
      setMessageList((list) => [...list, data]);
      setTypingStatus("");
    };

    const typingHandler = (data) => {
      setTypingStatus(`${data.author} yazıyor...`);
      setTimeout(() => {
        setTypingStatus("");
      }, 3000);
    };
    
    // YENİ: Eski mesajları yükleyen dinleyici
    const oldMessagesHandler = (data) => {
      console.log("Eski mesajlar yüklendi:", data);
      setMessageList(data); // Listeyi tamamen eski mesajlarla değiştir
    };
    
    socket.on("receive_message", messageHandler);
    socket.on("display_typing", typingHandler);
    socket.on("load_old_messages", oldMessagesHandler); // Dinlemeye başla

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("display_typing", typingHandler);
      socket.off("load_old_messages", oldMessagesHandler); // Temizle
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, typingStatus]); // typingStatus değişince de kaydır

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Canlı Sohbet: {room}</p>
      </div>
      <div className="chat-body">
        {messageList.map((messageContent, index) => {
          return (
            <div 
              key={index} 
              className="message" 
              id={username === messageContent.author ? "you" : "other"}
            >
              <div>
                <div className="message-content">
                  <p style={{color: 'black', margin: 0}}>{messageContent.message}</p>
                </div>
                <div className="message-meta">
                  <p id="time">{messageContent.time}</p>
                  <p id="author" style={{fontWeight: 'bold', marginLeft: '5px'}}>{messageContent.author}</p>
                </div>
              </div>
            </div>
          );
        })}
        {/* Yazıyor bilgisi burada görünecek */}
        {typingStatus && (
          <div className="typing-indicator" style={{fontStyle: 'italic', color: '#555', padding: '5px 10px', fontSize: '12px'}}>
            {typingStatus}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Bir mesaj yazın..."
          onChange={handleTyping} // Değişiklik: Buraya yeni fonksiyonu bağladık
          onKeyPress={(event) => { event.key === "Enter" && sendMessage(); }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
  );
}

export default Chat;
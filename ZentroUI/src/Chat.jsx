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
    
    const oldMessagesHandler = (data) => {
      setMessageList(data);
    };
    
    socket.on("receive_message", messageHandler);
    socket.on("display_typing", typingHandler);
    socket.on("load_old_messages", oldMessagesHandler);

    return () => {
      socket.off("receive_message", messageHandler);
      socket.off("display_typing", typingHandler);
      socket.off("load_old_messages", oldMessagesHandler);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messageList, typingStatus]);

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
        {typingStatus && (
          <div className="typing-indicator" style={{fontStyle: 'italic', color: '#555', padding: '5px 10px', fontSize: '12px'}}>
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
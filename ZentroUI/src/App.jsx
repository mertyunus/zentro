import { useState } from 'react';
import './App.css';
import io from 'socket.io-client';
import Chat from './Chat'; // Yeni yaptığımız dosyayı çağırdık

const socket = io.connect("http://localhost:3001");

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [showChat, setShowChat] = useState(false); // Sohbet ekranı açık mı?

  const joinRoom = () => {
    if (username !== "" && room !== "") {
      // Oda ismini String() içine alarak garantiye alıyoruz
      const odaID = String(room); 
      socket.emit("join_room", odaID);
      setShowChat(true);
    }
  };

  return (
    <div className="App">
      {!showChat ? (
        <div className="joinChatContainer" style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>Zentro Sohbet</h3>
          <input 
            type="text" 
            placeholder="Adınız..." 
            onChange={(event) => setUsername(event.target.value)}
          />
          <br /><br />
          <input 
            type="text" 
            placeholder="Oda ID..." 
            onChange={(event) => setRoom(event.target.value)}
          />
          <br /><br />
          <button onClick={joinRoom}>Odaya Katıl</button>
        </div>
      ) : (
        <Chat socket={socket} username={username} room={room} />
      )}
    </div>
  );
}

export default App;
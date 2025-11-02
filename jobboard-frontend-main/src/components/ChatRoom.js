

// import React, { useState, useEffect } from "react";
// import { io } from "socket.io-client";
// import axios from "axios";

// const socket = io("http://localhost:5000");

// const ChatRoom = ({ jobId, currentUserId, targetUserId }) => {
//   const [messages, setMessages] = useState([]);
//   const [messageInput, setMessageInput] = useState("");

//   const roomId = [jobId, currentUserId, targetUserId].sort().join("-");

//   useEffect(() => {
//     socket.emit("joinRoom", { roomId });

//     // ✅ Fetch messages using jobId only
//     axios.get(`http://localhost:5000/api/messages/job/${jobId}`)
//       .then(res => setMessages(res.data))
//       .catch(err => console.error("Failed to fetch messages", err));

//     socket.on("receiveMessage", (msg) => {
//       setMessages(prev => [...prev, msg]);
//     });

//     return () => {
//       socket.off("receiveMessage");
//     };
//   }, [roomId, jobId]);

//   const sendMessage = () => {
//     if (!messageInput) return;

//     const msgData = {
//       roomId,
//       senderId: currentUserId,
//       receiverId: targetUserId,
//       jobId,
//       message: messageInput,
//     };

//     socket.emit("sendMessage", msgData);
//     setMessageInput("");
//   };

//   return (
//     <div className="p-4 border rounded max-w-lg mx-auto">
//       <h2 className="text-lg font-bold mb-2">Chat</h2>
//       <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50">
//         {messages.map((msg, index) => (
//           <div
//             key={index}
//             className={`mb-2 p-2 rounded ${
//               msg.senderId === currentUserId ? "bg-green-200 text-right" : "bg-blue-100 text-left"
//             }`}
//           >
//             {msg.message}
//           </div>
//         ))}
//       </div>
//       <div className="flex gap-2">
//         <input
//           type="text"
//           value={messageInput}
//           onChange={(e) => setMessageInput(e.target.value)}
//           placeholder="Type your message..."
//           className="flex-1 border px-3 py-2 rounded"
//         />
//         <button onClick={sendMessage} className="bg-blue-500 text-white px-4 py-2 rounded">
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatRoom;

import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import axios from "axios";

// Connect to Socket.IO server
const socket = io("http://localhost:5000");

const ChatRoom = ({ jobId, currentUserId, targetUserId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");

  // Generate consistent roomId by sorting participant IDs + jobId
  const roomId = [jobId, currentUserId, targetUserId].sort().join("-");

  // Fetch chat history + join the socket room
  useEffect(() => {
    // Join socket room
    socket.emit("joinRoom", { roomId });

    // Fetch previous messages from backend (based on jobId)
    axios.get(`http://localhost:5000/api/messages/job/${jobId}`)
      .then((res) => setMessages(res.data))
      .catch((err) => console.error("❌ Failed to fetch messages:", err));

    // Listen for real-time incoming messages
    socket.on("receiveMessage", (newMessage) => {
      setMessages((prevMessages) => [...prevMessages, newMessage]);
    });

    // Cleanup when component unmounts
    return () => {
      socket.off("receiveMessage");
    };
  }, [roomId, jobId]);

  // Send a new message
  const sendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage = {
      roomId,
      senderId: currentUserId,
      receiverId: targetUserId,
      jobId,
      message: messageInput,
    };

    socket.emit("sendMessage", newMessage);
    setMessageInput("");
  };

  return (
    <div className="p-4 border rounded max-w-lg mx-auto">
      <h2 className="text-lg font-bold mb-3">Chat</h2>

      {/* Chat Message List */}
      <div className="h-64 overflow-y-auto border p-2 mb-4 bg-gray-50 rounded">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 p-2 rounded max-w-xs ${
              msg.senderId === currentUserId
                ? "ml-auto bg-green-200 text-right"
                : "mr-auto bg-blue-100 text-left"
            }`}
          >
            {msg.message}
          </div>
        ))}
      </div>

      {/* Input Field and Send Button */}
      <div className="flex gap-2">
        <input
          type="text"
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;

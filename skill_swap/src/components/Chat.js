import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { auth } from '../firebase';
import { socket } from '../services/api';

const API_URL = 'http://localhost:5000';

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]); // ✅ always array
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);

  /* 🔐 Auth */
  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (!user) navigate('/login');
      else setCurrentUser(user);
    });
    return () => unsub();
  }, [navigate]);

  /* 📜 Load chat history */
  useEffect(() => {
    if (!currentUser || !userId) return;

    const loadHistory = async () => {
      try {
        const res = await fetch(
          `${API_URL}/api/chat/history/${currentUser.uid}/${userId}`
        );

        const data = await res.json();

        // ✅ HARD FIX: normalize response
        if (Array.isArray(data)) {
          setMessages(data);
        } else if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error('Failed to load chat history', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [currentUser, userId]);

  /* 🔴 Socket.io */
  useEffect(() => {
    if (!currentUser || !userId) return;

    socket.emit('joinChat', {
      user1Uid: currentUser.uid,
      user2Uid: userId,
    });

    socket.on('newMessage', (message) => {
      setMessages((prev) => [...prev, message]); // ✅ prev always array
    });

    return () => socket.off('newMessage');
  }, [currentUser, userId]);

  /* 📤 Send */
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    socket.emit('sendMessage', {
      senderUid: currentUser.uid,
      recipientUid: userId,
      text: newMessage.trim(),
      fileUrl: null,
      fileName: null,
    });

    setNewMessage('');
  };

  /* ⬇ Auto scroll */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) {
    return (
      <div style={{ padding: 100, textAlign: 'center' }}>
        Loading chat...
      </div>
    );
  }

  const isMyMessage = (msg) => msg.senderUid === currentUser.uid;

  return (
    <div style={containerStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <button onClick={() => navigate(-1)} style={backBtnStyle}>←</button>
        <strong>Chat</strong>
      </div>

      {/* Messages */}
      <div style={messagesAreaStyle}>
        {messages.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666' }}>
            No messages yet. Start chatting 👋
          </p>
        ) : (
          messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...messageWrapperStyle,
                alignSelf: isMyMessage(msg) ? 'flex-end' : 'flex-start',
              }}
            >
              <div
                style={{
                  ...bubbleStyle,
                  background: isMyMessage(msg) ? '#0d6efd' : '#fff',
                  color: isMyMessage(msg) ? '#fff' : '#000',
                }}
              >
                <div>{msg.text}</div>
                <small style={{ opacity: 0.7 }}>
                  {msg.timestamp &&
                    new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                </small>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={inputAreaStyle}>
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          style={inputStyle}
        />
        <button onClick={sendMessage} style={sendBtnStyle}>
          Send
        </button>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const containerStyle = {
  height: '100vh',
  display: 'flex',
  flexDirection: 'column',
  background: '#f8fafc',
};

const headerStyle = {
  padding: 16,
  background: '#fff',
  borderBottom: '1px solid #e5e7eb',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
};

const backBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: 22,
  cursor: 'pointer',
};

const messagesAreaStyle = {
  flex: 1,
  padding: 20,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
  overflowY: 'auto',
};

const messageWrapperStyle = {
  maxWidth: '70%',
};

const bubbleStyle = {
  padding: '12px 16px',
  borderRadius: 18,
};

const inputAreaStyle = {
  padding: 16,
  display: 'flex',
  gap: 12,
  borderTop: '1px solid #e5e7eb',
  background: '#fff',
};

const inputStyle = {
  flex: 1,
  padding: 12,
  borderRadius: 24,
  border: '1px solid #ccc',
};

const sendBtnStyle = {
  padding: '12px 20px',
  background: '#0d6efd',
  color: '#fff',
  border: 'none',
  borderRadius: 24,
  cursor: 'pointer',
};

export default Chat;

import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './PublicRoom.css';
import { baseUrl } from '../../api/api';

const PublicRoom = () => {
  const socketRef = useRef(null);

  const [username, setUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [users, setUsers] = useState([]);
  const [showUsersList, setShowUsersList] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Initialize socket
  useEffect(() => {
    socketRef.current = io(baseUrl, { autoConnect: true });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Scroll messages to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Extract room code from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get('code');
    if (code) {
      setRoomCode(code);
      const storedUsername = localStorage.getItem('chat-username');
      if (storedUsername) {
        setUsername(storedUsername);
      } else {
        setShowUsernameModal(true);
      }
    }
  }, [location.search]);

  // Socket event listeners (join/reconnect/messages/etc.)
  useEffect(() => {
    if (!socketRef.current) return;
    const s = socketRef.current;

    // On connect or reconnect -> rejoin room if possible
    const handleConnect = () => {
      console.log('Socket connected:', s.id);
      if (roomCode && username) {
        s.emit('join-room', { roomCode, username });
      }
    };

    const handleReconnect = (attempt) => {
      console.log('Reconnected after', attempt, 'tries');
      if (roomCode && username) {
        s.emit('join-room', { roomCode, username });
      }
    };

    const handleRoomJoined = (data) => {
      setRoomName(data.roomName);
      setIsJoined(true);
      setIsLoading(false);
      setMessages(data.messages || []);
      setUsers(data.users || []);

      const params = new URLSearchParams(location.search);
      params.set('code', data.roomCode);
      navigate(`${location.pathname}?${params.toString()}`, { replace: true });
    };

    const handleRoomError = (errorMessage) => {
      setError(errorMessage);
      setIsLoading(false);
    };

    const handleUserJoined = (userData) => {
      setUsers(prev => [...prev, userData]);
      setMessages(prev => [...prev, {
        type: 'system',
        text: `${userData.username} has joined the room`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleUserLeft = (userData) => {
      setUsers(prev => prev.filter(user => user.id !== userData.id));
      setMessages(prev => [...prev, {
        type: 'system',
        text: `${userData.username} has left the room`,
        timestamp: new Date().toISOString()
      }]);
    };

    const handleChatMessage = (messageData) => {
      setMessages(prev => [...prev, messageData]);
    };

    s.on('connect', handleConnect);
    s.on('reconnect', handleReconnect);
    s.on('room-joined', handleRoomJoined);
    s.on('room-error', handleRoomError);
    s.on('user-joined', handleUserJoined);
    s.on('user-left', handleUserLeft);
    s.on('chat-message', handleChatMessage);

    return () => {
      s.off('connect', handleConnect);
      s.off('reconnect', handleReconnect);
      s.off('room-joined', handleRoomJoined);
      s.off('room-error', handleRoomError);
      s.off('user-joined', handleUserJoined);
      s.off('user-left', handleUserLeft);
      s.off('chat-message', handleChatMessage);
    };
  }, [roomCode, username, navigate, location.pathname]);

  // Join room
  const handleJoinRoom = async (code = roomCode, name = username) => {
    if (!socketRef.current || !name) return;

    setIsLoading(true);
    setError('');
    localStorage.setItem('chat-username', name);

    try {
      const res = await fetch(`${baseUrl}/public-room/validate/${code}`);
      const data = await res.json();

      if (data.success) {
        socketRef.current.emit('join-room', { roomCode: code, username: name });
      } else {
        setError(data.message || 'Invalid room code');
      }
    } catch (err) {
      console.error('Error validating room code:', err);
      setError('Failed to validate room code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitUsername = (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setShowUsernameModal(false);
    handleJoinRoom(roomCode, username);
  };

  const handleSubmitCode = (e) => {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    const storedUsername = localStorage.getItem('chat-username');
    if (storedUsername) {
      setUsername(storedUsername);
      handleJoinRoom(roomCode, storedUsername);
    } else {
      setShowUsernameModal(true);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socketRef.current || !isJoined) return;

    socketRef.current.emit('send-message', {
      roomCode,
      text: messageText,
      username
    });

    setMessageText('');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const toggleUsersList = () => {
    setShowUsersList(prev => !prev);
  };

  return (
    <div className="public-room-container">
      {/* Username Modal */}
      {showUsernameModal && (
        <div className="modal-overlay">
          <div className="username-modal">
            <h2>Enter Your Name</h2>
            <p>Please enter your name to join the chat room</p>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmitUsername}>
              <input
                type="text"
                placeholder="Your name"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                maxLength={20}
              />
              <button type="submit" disabled={!username.trim()}>
                Continue
              </button>
            </form>
            <button className="back-button" onClick={handleBackToHome}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {!isJoined ? (
        <div className="join-room-form">
          <h2>Join Public Chat Room</h2>
          <p className="join-room-info">
            Enter a public room code to chat with others in real-time
          </p>
          {error && <div className="error-message">{error}</div>}
          <form onSubmit={handleSubmitCode}>
            <input
              type="text"
              placeholder="Enter room code (e.g., ABC123)"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Joining...' : 'Join Room'}
            </button>
          </form>
          <button className="back-button" onClick={handleBackToHome}>
            Back to Home
          </button>
        </div>
      ) : (
        <div className="chat-room">
          <div className="room-header">
            <h2>{roomName}</h2>
            <div className="room-code">
              Room Code: <span>{roomCode}</span>
            </div>
          </div>

          <div className="chat-container">
            <button
              className="toggle-users-btn"
              onClick={toggleUsersList}
              title="Toggle users list"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7Zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216ZM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              </svg>
              <span className="user-count">{users.length}</span>
            </button>

            <div className={`users-sidebar ${showUsersList ? 'visible' : ''}`}>
              <h3>Online Users ({users.length})</h3>
              <ul className="users-list">
                {users.map((user) => (
                  <li
                    key={user.id}
                    className={user.username === username ? 'current-user' : ''}
                  >
                    {user.username} {user.username === username && '(You)'}
                  </li>
                ))}
              </ul>
            </div>

            <div className="messages-container">
              <div className="messages">
                {messages.length === 0 ? (
                  <div className="no-messages">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((message, index) => (
                    <div
                      className={`message ${
                        message.type === 'system'
                          ? 'system-message'
                          : message.username === username
                          ? 'my-message'
                          : ''
                      }`}
                      key={index}
                    >
                      {message.type !== 'system' && (
                        <div className="message-username">
                          {message.username === username ? 'You' : message.username}
                        </div>
                      )}
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">
                        {new Date(message.timestamp).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form className="message-form" onSubmit={handleSendMessage}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <button type="submit" disabled={!messageText.trim()}>
                  Send
                </button>
              </form>
            </div>
          </div>

          <button className="leave-button" onClick={handleBackToHome}>
            Leave Room
          </button>
        </div>
      )}
    </div>
  );
};

export default PublicRoom;

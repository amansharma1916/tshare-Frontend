import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import './PublicRoom.css';
import { baseUrl } from '../../api/api';

const PublicRoom = () => {
    const [socket, setSocket] = useState(null);
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
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io(baseUrl);
        setSocket(newSocket);

        // Clean up the socket connection when component unmounts
        return () => {
            if (newSocket) newSocket.disconnect();
        };
    }, []);

    // Auto-scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Check for room code in URL
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const code = params.get('code');
        if (code) {
            setRoomCode(code);
            const storedUsername = localStorage.getItem('chat-username');
            if (storedUsername) {
                setUsername(storedUsername);
                if (socket) {
                    handleJoinRoom(code, storedUsername);
                }
            } else {
                setShowUsernameModal(true);
            }
        }
    }, [location.search, socket]);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket) return;

        socket.on('room-joined', (data) => {
            setRoomName(data.roomName);
            setIsJoined(true);
            setIsLoading(false);
            setMessages(data.messages || []);
            setUsers(data.users || []);

            // Update URL with room code
            const params = new URLSearchParams(location.search);
            params.set('code', data.roomCode);
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        });

        socket.on('room-error', (errorMessage) => {
            setError(errorMessage);
            setIsLoading(false);
        });

        socket.on('user-joined', (userData) => {
            setUsers(prev => [...prev, userData]);
            setMessages(prev => [...prev, {
                type: 'system',
                text: `${userData.username} has joined the room`,
                timestamp: new Date().toISOString()
            }]);
        });

        socket.on('user-left', (userData) => {
            setUsers(prev => prev.filter(user => user.id !== userData.id));
            setMessages(prev => [...prev, {
                type: 'system',
                text: `${userData.username} has left the room`,
                timestamp: new Date().toISOString()
            }]);
        });

        socket.on('chat-message', (messageData) => {
            setMessages(prev => [...prev, messageData]);
        });

        return () => {
            socket.off('room-joined');
            socket.off('room-error');
            socket.off('user-joined');
            socket.off('user-left');
            socket.off('chat-message');
        };
    }, [socket, navigate, location.pathname]);

    const handleJoinRoom = (code = roomCode, name = username) => {
        if (!socket || !name) return;

        setIsLoading(true);
        setError('');
        localStorage.setItem('chat-username', name);

        // Validate the room code with the server
        fetch(`${baseUrl}/public-room/validate/${code}`)
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Room code is valid, join the room
                    socket.emit('join-room', {
                        roomCode: code,
                        username: name
                    });
                } else {
                    setError(data.message || 'Invalid room code');
                    setIsLoading(false);
                }
            })
            .catch(err => {
                console.error('Error validating room code:', err);
                setError('Failed to validate room code');
                setIsLoading(false);
            });
    };

    const handleSubmitUsername = (e) => {
        e.preventDefault();
        if (username.trim() === '') {
            return;
        }
        setShowUsernameModal(false);
        handleJoinRoom(roomCode, username);
    };

    const handleSubmitCode = (e) => {
        e.preventDefault();
        if (roomCode.trim() === '') {
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

        if (!messageText.trim() || !socket || !isJoined) return;

        socket.emit('send-message', {
            roomCode,
            text: messageText,
            username
        });

        setMessageText('');
    };

    const handleBackToHome = () => {
        navigate('/');
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
                        <button
                            className="back-button"
                            onClick={handleBackToHome}
                        >
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
                    <button
                        className="back-button"
                        onClick={handleBackToHome}
                    >
                        Back to Home
                    </button>
                </div>
            ) : (
                <div className="chat-room">
                    <div className="room-header">
                        <h2>{roomName}</h2>
                        <div className="room-code">Room Code: <span>{roomCode}</span></div>
                    </div>

                    <div className="chat-container">
                        <div className="users-sidebar">
                            <h3>Online Users ({users.length})</h3>
                            <ul className="users-list">
                                {users.map((user) => (
                                    <li key={user.id} className={user.username === username ? 'current-user' : ''}>
                                        {user.username} {user.username === username && '(You)'}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="messages-container">
                            <div className="messages">
                                {messages.length === 0 ? (
                                    <div className="no-messages">No messages yet. Start the conversation!</div>
                                ) : (
                                    messages.map((message, index) => (
                                        <div
                                            className={`message ${message.type === 'system' ? 'system-message' : message.username === username ? 'my-message' : ''}`}
                                            key={index}
                                        >
                                            {message.type !== 'system' && (
                                                <div className="message-username">
                                                    {message.username === username ? 'You' : message.username}
                                                </div>
                                            )}
                                            <div className="message-text">{message.text}</div>
                                            <div className="message-time">
                                                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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

                    <button
                        className="leave-button"
                        onClick={handleBackToHome}
                    >
                        Leave Room
                    </button>
                </div>
            )}
        </div>
    );
};

export default PublicRoom;

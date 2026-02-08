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
    const [isOffline, setIsOffline] = useState(false);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState([]);

    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        socketRef.current = io(baseUrl, {
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000,
            transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
            forceNew: true,
            path: '/socket.io/', // Make sure path matches server configuration
            extraHeaders: { "Access-Control-Allow-Origin": "*" }
        });

        socketRef.current.on('connect_error', (err) => {
            console.error('Socket connection error:', err.message);
            setIsOffline(true);

            if (socketRef.current.io.opts.transports[0] === 'websocket') {
                console.log('Switching to polling transport');
                socketRef.current.io.opts.transports = ['polling', 'websocket'];
                socketRef.current.connect();
            }
        });

        socketRef.current.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
            setIsOffline(true);
        });

        socketRef.current.on('connect', () => {
            console.log('Socket connected with transport:', socketRef.current.io.engine.transport.name);
            setIsOffline(false);
        });

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

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

    useEffect(() => {
        if (!socketRef.current) return;
        const s = socketRef.current;

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
            setRoomName(data.roomName || `Public Room ${data.roomCode}`);
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
                text: `${userData.username} joined the room`,
                timestamp: new Date().toISOString()
            }]);
        };

        const handleUserLeft = (userData) => {
            setUsers(prev => prev.filter(user => user.id !== userData.id));
            setMessages(prev => [...prev, {
                type: 'system',
                text: `${userData.username} left the room`,
                timestamp: new Date().toISOString()
            }]);
        };

        const handleChatMessage = (messageData) => {
            setMessages(prev => [...prev, messageData]);
        };

        const handleTypingStart = (data) => {
            setTypingUsers(prev => {
                if (!prev.some(user => user.username === data.username)) {
                    return [...prev, data];
                }
                return prev;
            });
        };

        const handleTypingStop = (data) => {
            setTypingUsers(prev => prev.filter(user => user.username !== data.username));
        };

        s.on('connect', handleConnect);
        s.on('reconnect', handleReconnect);
        s.on('room-joined', handleRoomJoined);
        s.on('room-error', handleRoomError);
        s.on('user-joined', handleUserJoined);
        s.on('user-left', handleUserLeft);
        s.on('chat-message', handleChatMessage);
        s.on('typing-start', handleTypingStart);
        s.on('typing-stop', handleTypingStop);

        return () => {
            s.off('connect', handleConnect);
            s.off('reconnect', handleReconnect);
            s.off('room-joined', handleRoomJoined);
            s.off('room-error', handleRoomError);
            s.off('user-joined', handleUserJoined);
            s.off('user-left', handleUserLeft);
            s.off('chat-message', handleChatMessage);
            s.off('typing-start', handleTypingStart);
            s.off('typing-stop', handleTypingStop);
        };
    }, [roomCode, username, navigate, location.pathname]);

    const handleJoinRoom = async (code = roomCode, name = username) => {
        if (!socketRef.current || !name) return;

        setIsLoading(true);
        setError('');
        localStorage.setItem('chat-username', name);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const res = await fetch(`${baseUrl}/public-room/validate/${code}`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            const data = await res.json();

            if (data.success) {
                let responseReceived = false;

                const onRoomJoined = () => {
                    responseReceived = true;
                    socketRef.current.off('room-error', onRoomError);
                };

                const onRoomError = (errorMsg) => {
                    responseReceived = true;
                    setError(errorMsg);
                    socketRef.current.off('room-joined', onRoomJoined);
                    setIsLoading(false);
                };

                socketRef.current.once('room-joined', onRoomJoined);
                socketRef.current.once('room-error', onRoomError);

                socketRef.current.emit('join-room', { roomCode: code, username: name });

                setTimeout(() => {
                    if (!responseReceived) {
                        socketRef.current.off('room-joined', onRoomJoined);
                        socketRef.current.off('room-error', onRoomError);
                        setError('Room join request timed out. Please try again.');
                        setIsLoading(false);
                    }
                }, 8000);

            } else {
                setError(data.message || 'Invalid room code');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Error validating room code:', err);
            if (err.name === 'AbortError') {
                setError('Request timed out. Please check your connection and try again.');
            } else {
                setError('Failed to validate room code');
            }
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
        if (!messageText.trim() || !socketRef.current || !isJoined || isSendingMessage) return;

        setIsSendingMessage(true);

        const messageToSend = {
            roomCode,
            text: messageText,
            username
        };

        const timeoutId = setTimeout(() => {
            console.error('Message acknowledgment timeout');
            setIsOffline(true);
            setIsSendingMessage(false);
        }, 5000);

        const handleAck = (success) => {
            clearTimeout(timeoutId);
            setIsSendingMessage(false);

            if (success === false) {
                console.error('Message sending failed on server');
            }
        };

        setMessageText('');
        setIsTyping(false);

        if (socketRef.current) {
            socketRef.current.emit('typing-stop', { roomCode, username });
        }

        try {
            socketRef.current.emit('send-message', messageToSend, handleAck);
        } catch (error) {
            console.error('Error emitting message:', error);
            setIsSendingMessage(false);
            setIsOffline(true);

            setMessages(prev => [...prev, {
                ...messageToSend,
                timestamp: new Date(),
                type: 'message',
                pending: true
            }]);
        }
    };

    const handleTyping = (e) => {
        setMessageText(e.target.value);
        
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (!isTyping && socketRef.current) {
            setIsTyping(true);
            socketRef.current.emit('typing-start', { roomCode, username });
        }
        
        typingTimeoutRef.current = setTimeout(() => {
            if (socketRef.current) {
                socketRef.current.emit('typing-stop', { roomCode, username });
            }
            setIsTyping(false);
        }, 1000);
    };

    const handleBackToHome = () => {
        navigate('/');
    };

    const toggleUsersList = () => {
        setShowUsersList(prev => !prev);
    };

    const touchStartRef = useRef(null);
    const handleTouchStart = (e) => {
        touchStartRef.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        if (!touchStartRef.current) return;

        const touchEnd = e.changedTouches[0].clientX;
        const diff = touchStartRef.current - touchEnd;

        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setShowUsersList(true);
            } else {
                setShowUsersList(false);
            }
        }

        touchStartRef.current = null;
    };

    const getUserColor = (username) => {
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }

        const hue = Math.abs(hash % 360);
        return `hsl(${hue}, 65%, 55%)`;
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const leaveRoom = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        setIsJoined(false);
        setMessages([]);
        setUsers([]);
        navigate('/');
    };

    return (
        <div className="public-room-container">
            {}
            {isOffline && (
                <div className="offline-indicator">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M10.706 3.294A12.545 12.545 0 0 0 8 3C5.259 3 2.723 3.882.663 5.379a.485.485 0 0 0-.048.736.518.518 0 0 0 .668.05A11.448 11.448 0 0 1 8 4c.63 0 1.249.05 1.852.148l.854-.854zM8 6c-1.905 0-3.68.56-5.166 1.526a.48.48 0 0 0-.063.745.525.525 0 0 0 .652.065 8.448 8.448 0 0 1 3.51-1.27L8 6zm2.596 1.404.785-.785c.63.24 1.227.545 1.785.907a.482.482 0 0 1 .063.745.525.525 0 0 1-.652.065 8.462 8.462 0 0 0-1.98-.932zM8 10l.933-.933a6.455 6.455 0 0 1 2.013.637c.285.145.326.524.1.75-.226.226-.551.19-.75-.1-.15-.15-.314-.289-.486-.406L8 10z" />
                        <path d="M13.229 8.271a.482.482 0 0 0-.063-.745A9.455 9.455 0 0 0 8 6c-.887 0-1.744.128-2.558.364l-.22-.22A10.545 10.545 0 0 1 8 5c.8 0 1.55.154 2.25.41l.773-.772a.25.25 0 0 1 .175-.073h.15L13.5 6l-2.147.146a.25.25 0 0 0-.175.073l-.847.847zm-8.65 1.195-.20.02a11.527 11.527 0 0 1-.576-.11l-.21.21a.5.5 0 0 1-.707 0l-1.05-1.05a.5.5 0 0 1 0-.707l.316-.316a6.527 6.527 0 0 1-.588-.314.48.48 0 0 0-.654.104.506.506 0 0 0 .056.682A12.487 12.487 0 0 0 5.937 9.45l-1.358 1.358a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 0-.707l1.743-1.743A12.55 12.55 0 0 0 8 7a12.55 12.55 0 0 0 6.336 1.696c.079 0 .158-.001.237-.004.003-.079.004-.158.004-.237a12.55 12.55 0 0 0-1.696-6.336l.016-.017-1.472-1.473a.5.5 0 0 1 0-.707zM8 1c.273 0 .547.006.82.019l.73-.73A.25.25 0 0 0 8.7 0H7.3a.25.25 0 0 0-.15.45l.73.73c.273-.013.547-.02.82-.02z" />
                        <path d="M5 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm-2-1a2 2 0 1 0 4 0 2 2 0 0 0-4 0z" />
                    </svg>
                    <span>Connection Lost</span>
                    <button
                        className="retry-button"
                        onClick={() => {
                            if (socketRef.current) {
                                socketRef.current.disconnect();

                                socketRef.current = io(baseUrl, {
                                    autoConnect: true,
                                    reconnection: true,
                                    reconnectionAttempts: 5,
                                    reconnectionDelay: 1000,
                                    reconnectionDelayMax: 3000,
                                    timeout: 20000,
                                    transports: ['polling', 'websocket'], // Try polling first as it's more reliable
                                    forceNew: true,
                                    path: '/socket.io/'
                                });

                                socketRef.current.on('connect_error', (err) => {
                                    console.error('Socket connection error on retry:', err.message);
                                    setIsOffline(true);
                                });

                                socketRef.current.on('disconnect', (reason) => {
                                    console.log('Socket disconnected on retry:', reason);
                                    setIsOffline(true);
                                });

                                socketRef.current.on('connect', () => {
                                    console.log('Socket reconnected with transport:',
                                        socketRef.current.io.engine.transport.name);
                                    setIsOffline(false);

                                    if (isJoined && roomCode && username) {
                                        socketRef.current.emit('join-room', { roomCode, username });

                                        socketRef.current.once('room-joined', (data) => {
                                            console.log('Successfully rejoined room');
                                            if (data.messages && data.messages.length > 0) {
                                                const lastLocalMessageTime = messages.length > 0 ?
                                                    new Date(messages[messages.length - 1].timestamp).getTime() : 0;

                                                const newMessages = data.messages.filter(msg =>
                                                    new Date(msg.timestamp).getTime() > lastLocalMessageTime
                                                );

                                                if (newMessages.length > 0) {
                                                    setMessages(prev => [...prev, ...newMessages]);
                                                }
                                            }
                                            setUsers(data.users || []);
                                        });

                                        socketRef.current.once('room-error', (errorMsg) => {
                                            console.error('Error rejoining room:', errorMsg);
                                            setIsJoined(false);
                                        });
                                    }
                                });
                            }
                        }}
                    >
                        Retry Connection
                    </button>
                </div>
            )}

            {}
            {showUsernameModal && (
                <div className="modal-overlay">
                    <div className="username-modal">
                        <h2>Welcome to Public Chat</h2>
                        <p>Enter your name to join the conversation</p>
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
                        <button className="back-link" onClick={handleBackToHome}>
                            Cancel
                        </button>
                    </div>
                </div>
            )}

            {!isJoined ? (
                <div className="code-entry-container">
                    <div className="code-entry-form">
                        <h1>Join Public Chat Room</h1>
                        <p className="join-room-info">
                            Enter a public room code to chat with others in real-time
                        </p>
                        {error && <div className="error-message">{error}</div>}
                        <form onSubmit={handleSubmitCode}>
                            <div className="form-group">
                                <label htmlFor="roomCode">Room Code</label>
                                <input
                                    id="roomCode"
                                    type="text"
                                    placeholder="Enter room code (e.g., ABC123)"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    disabled={isLoading}
                                />
                            </div>
                            <button className="join-btn" type="submit" disabled={isLoading}>
                                {isLoading ? 'Joining...' : 'Join Room'}
                            </button>
                        </form>
                        <div className="room-info">
                            Don't have a room code? Create one on the home page.
                        </div>
                        <button className="back-link" onClick={handleBackToHome}>
                            Back to Home
                        </button>
                    </div>
                </div>
            ) : (
                <div className="chat-room">
                    <div className="room-header">
                        <h2>{roomName || `Public Room ${roomCode}`}</h2>
                        <div className="room-code">
                            Room Code: <span>{roomCode}</span>
                        </div>
                    </div>

                    <div
                        className="chat-container"
                        onTouchStart={handleTouchStart}
                        onTouchEnd={handleTouchEnd}
                    >
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
                                    <>
                                        {messages.map((message, index) => (
                                            <div
                                                className={`message ${message.type === 'system'
                                                    ? 'system-message'
                                                    : message.username === username
                                                        ? 'my-message'
                                                        : 'other-message'
                                                    }`}
                                                key={index}
                                            >
                                                {message.type !== 'system' && (
                                                    <div className="message-username">
                                                        {message.username === username ? 'You' : message.username}
                                                    </div>
                                                )}
                                                <div className="message-content">
                                                    <div className="message-text">{message.text}</div>
                                                    <div className="message-time">
                                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                                            hour: '2-digit',
                                                            minute: '2-digit',
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {}
                                        {typingUsers.length > 0 && typingUsers.some(user => user.username !== username) && (
                                            <div className="message system-message">
                                                {typingUsers
                                                    .filter(user => user.username !== username)
                                                    .map(user => user.username)
                                                    .join(', ')} {typingUsers.length > 1 ? 'are' : 'is'} typing...
                                            </div>
                                        )}
                                    </>
                                )}
                                <div ref={messagesEndRef} />
                            </div>

                            <form className="message-form" onSubmit={handleSendMessage}>
                                <input
                                    type="text"
                                    placeholder="Type your message..."
                                    value={messageText}
                                    onChange={handleTyping}
                                    disabled={isSendingMessage}
                                />
                                <button type="submit" disabled={!messageText.trim() || isSendingMessage}>
                                    {isSendingMessage ? 'Sending...' : 'Send'}
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

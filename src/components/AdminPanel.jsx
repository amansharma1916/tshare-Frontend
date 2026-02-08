import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const AdminPanel = () => {
    const [texts, setTexts] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imagesLoading, setImagesLoading] = useState(true);
    const [error, setError] = useState('');
    const [imagesError, setImagesError] = useState('');
    const [editingText, setEditingText] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [showImageCodeModal, setShowImageCodeModal] = useState(false);
    const [editingImage, setEditingImage] = useState(null);
    const [newImageCode, setNewImageCode] = useState('');
    const [imageCodeError, setImageCodeError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [actionMessage, setActionMessage] = useState({ text: '', type: '' });


    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            window.location.href = '/admin/login';
        }
        refreshAll();
    }, []);

    const refreshAll = () => {
        fetchTexts();
        fetchImages();
        fetchPublicRooms();
    };

    const fetchTexts = async () => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(endpoints.adminTexts);
            const data = await response.json();

            if (data.success) {
                setTexts(data.texts);
            } else {
                setError('Failed to fetch texts');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const fetchImages = async () => {
        setImagesLoading(true);
        setImagesError('');

        try {
            const response = await fetch(endpoints.adminImages);
            const data = await response.json();

            if (data.success) {
                setImages(data.images);
            } else {
                setImagesError('Failed to fetch images');
            }
        } catch (error) {
            console.error('Error:', error);
            setImagesError('Failed to connect to server. Please try again.');
        } finally {
            setImagesLoading(false);
        }
    };

    const handleDeleteText = async (id) => {
        if (!window.confirm('Are you sure you want to delete this text?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteText(id), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.filter(text => text.id !== id));
                showActionMessage('Text deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete text', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteAllTexts = async () => {
        if (!window.confirm('Are you sure you want to delete ALL texts? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteAllTexts, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setTexts([]);
                showActionMessage('All texts deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete texts', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteImage = async (id) => {
        if (!window.confirm('Are you sure you want to delete this image?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteImage(id), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.filter(image => image.id !== id));
                showActionMessage('Image deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete image', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeleteAllImages = async () => {
        if (!window.confirm('Are you sure you want to delete ALL images? This action cannot be undone.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeleteAllImages, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setImages([]);
                showActionMessage('All images deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete images', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleEditText = (text) => {
        setEditingText(text);
        setEditedContent(text.text);
    };

    const handleUpdateText = async () => {
        if (!editingText) return;

        try {
            const response = await fetch(endpoints.adminUpdateText(editingText.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: editedContent }),
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === editingText.id ? { ...text, text: editedContent } : text
                ));
                setEditingText(null);
                showActionMessage('Text updated successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to update text', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleCancelEdit = () => {
        setEditingText(null);
        setEditedContent('');
    };

    const handleEditCode = (text) => {
        setEditingCode(text);
        setNewCode(text.id.toString());
        setCodeError('');
        setShowCodeModal(true);
    };

    const handleUpdateCode = async () => {
        if (!editingCode) return;
        setCodeError('');

        if (!newCode || isNaN(newCode) || newCode.length !== 4 || parseInt(newCode) < 1000 || parseInt(newCode) > 9999) {
            setCodeError('Code must be a 4-digit number between 1000 and 9999');
            return;
        }

        try {
            const response = await fetch(endpoints.adminUpdateCode(editingCode.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCode: parseInt(newCode) }),
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === editingCode.id ? { ...text, id: parseInt(newCode) } : text
                ));
                setShowCodeModal(false);
                setEditingCode(null);
                setNewCode('');
                showActionMessage('Code updated successfully', 'success');
            } else {
                setCodeError(data.message || 'Failed to update code');
            }
        } catch (error) {
            console.error('Error:', error);
            setCodeError('Failed to connect to server');
        }
    };

    const handleRegenerateCode = async (id) => {
        if (!window.confirm('Are you sure you want to generate a new random code for this text?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminRegenerateCode(id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                setTexts(texts.map(text =>
                    text.id === parseInt(data.oldCode) ? { ...text, id: data.newCode } : text
                ));
                showActionMessage(`Code regenerated successfully: ${data.newCode}`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to regenerate code', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleCheckCodeAvailability = async () => {
        if (!newCode || newCode.length !== 4) return;

        try {
            const response = await fetch(endpoints.adminCheckCode(newCode));
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && parseInt(newCode) !== editingCode.id) {
                    setCodeError('This code is already in use. Please choose a different code.');
                } else {
                    setCodeError('');
                }
            }
        } catch (error) {
            console.error('Error checking code availability:', error);
        }
    };

    const handleCancelCodeEdit = () => {
        setShowCodeModal(false);
        setEditingCode(null);
        setNewCode('');
        setCodeError('');
    };

    const handleEditImageCode = (image) => {
        setEditingImage(image);
        setNewImageCode(image.id.toString());
        setImageCodeError('');
        setShowImageCodeModal(true);
    };

    const handleUpdateImageCode = async () => {
        if (!editingImage) return;
        setImageCodeError('');

        if (!newImageCode || isNaN(newImageCode) || newImageCode.length !== 4 || parseInt(newImageCode) < 1000 || parseInt(newImageCode) > 9999) {
            setImageCodeError('Code must be a 4-digit number between 1000 and 9999');
            return;
        }

        try {
            const response = await fetch(endpoints.adminUpdateImageCode(editingImage.id), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newCode: parseInt(newImageCode) }),
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.map(image =>
                    image.id === editingImage.id ? { ...image, id: parseInt(newImageCode) } : image
                ));
                setShowImageCodeModal(false);
                setEditingImage(null);
                setNewImageCode('');
                showActionMessage('Image code updated successfully', 'success');
            } else {
                setImageCodeError(data.message || 'Failed to update code');
            }
        } catch (error) {
            console.error('Error:', error);
            setImageCodeError('Failed to connect to server');
        }
    };

    const handleCheckImageCodeAvailability = async () => {
        if (!newImageCode || newImageCode.length !== 4) return;

        try {
            const response = await fetch(endpoints.adminCheckImageCode(newImageCode));
            const data = await response.json();

            if (data.success) {
                if (!data.isAvailable && parseInt(newImageCode) !== editingImage.id) {
                    setImageCodeError('This code is already in use. Please choose a different code.');
                } else {
                    setImageCodeError('');
                }
            }
        } catch (error) {
            console.error('Error checking image code availability:', error);
        }
    };

    const handleRegenerateImageCode = async (id) => {
        if (!window.confirm('Are you sure you want to generate a new random code for this image?')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminRegenerateImageCode(id), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const data = await response.json();

            if (data.success) {
                setImages(images.map(image =>
                    image.id === parseInt(data.oldCode) ? { ...image, id: data.newCode } : image
                ));
                showActionMessage(`Image code regenerated: ${data.newCode}`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to regenerate image code', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleCancelImageCodeEdit = () => {
        setShowImageCodeModal(false);
        setEditingImage(null);
        setNewImageCode('');
        setImageCodeError('');
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        try {
            const response = await fetch(endpoints.adminChangePassword, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ currentPassword, newPassword }),
            });

            const data = await response.json();

            if (data.success) {
                setShowPasswordModal(false);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                showActionMessage('Password changed successfully', 'success');
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error:', error);
            setPasswordError('Failed to connect to server');
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('adminAuthenticated');
        window.location.href = '/';
    };

    const showActionMessage = (text, type) => {
        setActionMessage({ text, type });
        setTimeout(() => {
            setActionMessage({ text: '', type: '' });
        }, 3000);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const formatFileSize = (size) => {
        if (!size && size !== 0) return 'N/A';
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        if (size < 1024 * 1024 * 1024) return `${(size / (1024 * 1024)).toFixed(1)} MB`;
        return `${(size / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    };

    const [publicRooms, setPublicRooms] = useState([]);
    const [publicRoomName, setPublicRoomName] = useState('');
    const [showPublicRoomModal, setShowPublicRoomModal] = useState(false);
    const [publicRoomsLoading, setPublicRoomsLoading] = useState(false);

    const fetchPublicRooms = async () => {
        setPublicRoomsLoading(true);
        try {
            const response = await fetch(endpoints.adminPublicRooms);
            const data = await response.json();

            if (data.success) {
                setPublicRooms(data.rooms);
            } else {
                showActionMessage('Failed to fetch public rooms', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        } finally {
            setPublicRoomsLoading(false);
        }
    };

    const handleCreatePublicRoom = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(endpoints.adminPublicRooms, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: publicRoomName }),
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms([data.room, ...publicRooms]);
                setShowPublicRoomModal(false);
                setPublicRoomName('');
                showActionMessage(`Public room created with code: ${data.room.code}`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to create public room', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleDeletePublicRoom = async (code) => {
        if (!window.confirm('Are you sure you want to delete this public room? All messages will be permanently deleted.')) {
            return;
        }

        try {
            const response = await fetch(endpoints.adminDeletePublicRoom(code), {
                method: 'DELETE',
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms(publicRooms.filter(room => room.code !== code));
                showActionMessage('Public room deleted successfully', 'success');
            } else {
                showActionMessage(data.message || 'Failed to delete public room', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const handleToggleRoomStatus = async (code) => {
        try {
            const response = await fetch(endpoints.adminTogglePublicRoomStatus(code), {
                method: 'PUT',
            });

            const data = await response.json();

            if (data.success) {
                setPublicRooms(publicRooms.map(room =>
                    room.code === code ? { ...room, active: data.active } : room
                ));
                showActionMessage(`Room ${data.active ? 'activated' : 'deactivated'} successfully`, 'success');
            } else {
                showActionMessage(data.message || 'Failed to update room status', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showActionMessage('Failed to connect to server', 'error');
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text)
            .then(() => showActionMessage('Copied to clipboard', 'success'))
            .catch(err => console.error('Failed to copy:', err));
    };

    return (
        <div className="admin-panel-container">
            <div className="nameBanner">
                {bannerText} <span className="admin-badge">Admin Panel</span>
            </div>

            <div className="admin-controls">
                <button className="Btn refresh" onClick={refreshAll}>
                    Refresh Data
                </button>
                <button className="Btn delete-all" onClick={handleDeleteAllTexts}>
                    Delete All Texts
                </button>
                <button className="Btn delete-all" onClick={handleDeleteAllImages}>
                    Delete All Images
                </button>
                <button className="Btn create-public" onClick={() => setShowPublicRoomModal(true)}>
                    Create Public Room
                </button>
                <button className="Btn change-password" onClick={() => setShowPasswordModal(true)}>
                    Change Password
                </button>
                <button className="Btn logout" onClick={handleLogout}>
                    Logout
                </button>
            </div>

            {actionMessage.text && (
                <div className={`action-message ${actionMessage.type}`}>
                    {actionMessage.text}
                </div>
            )}

            <div className="admin-content">
                <h1>Shared Texts ({texts.length})</h1>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : error ? (
                    <div className="error-message">{error}</div>
                ) : texts.length === 0 ? (
                    <div className="no-data">No texts found</div>
                ) : (
                    <div className="texts-table-container">
                        <table className="texts-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Text</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {texts.map(text => (
                                    <tr key={text.id}>
                                        <td>{text.id}</td>
                                        <td className="text-content">
                                            {text.text.length > 100
                                                ? `${text.text.substring(0, 100)}...`
                                                : text.text}
                                        </td>
                                        <td>{formatDate(text.createdAt)}</td>
                                        <td className="actions">
                                            <button className="action-btn edit" onClick={() => handleEditText(text)}>
                                                Edit Text
                                            </button>
                                            <button className="action-btn edit-code" onClick={() => handleEditCode(text)}>
                                                Edit Code
                                            </button>
                                            <button className="action-btn regenerate-code" onClick={() => handleRegenerateCode(text.id)}>
                                                New Code
                                            </button>
                                            <button className="action-btn delete" onClick={() => handleDeleteText(text.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <h1 className="section-header">Shared Images ({images.length})</h1>

                {imagesLoading ? (
                    <div className="loading">Loading images...</div>
                ) : imagesError ? (
                    <div className="error-message">{imagesError}</div>
                ) : images.length === 0 ? (
                    <div className="no-data">No images found</div>
                ) : (
                    <div className="texts-table-container">
                        <table className="texts-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Preview</th>
                                    <th>File</th>
                                    <th>Size</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {images.map(image => (
                                    <tr key={image.id}>
                                        <td>{image.id}</td>
                                        <td>
                                            <div className="image-thumb">
                                                <img src={image.url} alt={image.originalName || 'Shared'} />
                                            </div>
                                        </td>
                                        <td className="text-content">
                                            {image.originalName || 'Shared image'}
                                        </td>
                                        <td>{formatFileSize(image.size)}</td>
                                        <td>{formatDate(image.createdAt)}</td>
                                        <td className="actions">
                                            <button
                                                className="action-btn copy-code"
                                                onClick={() => copyToClipboard(image.id.toString())}
                                            >
                                                Copy Code
                                            </button>
                                            <button
                                                className="action-btn edit"
                                                onClick={() => window.open(image.url, '_blank', 'noopener')}
                                            >
                                                View
                                            </button>
                                            <button
                                                className="action-btn edit-code"
                                                onClick={() => handleEditImageCode(image)}
                                            >
                                                Edit Code
                                            </button>
                                            <button
                                                className="action-btn regenerate-code"
                                                onClick={() => handleRegenerateImageCode(image.id)}
                                            >
                                                New Code
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeleteImage(image.id)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <h1 className="section-header">Public Rooms ({publicRooms.length})</h1>
                <button className="Btn create-public-room" onClick={() => setShowPublicRoomModal(true)}>
                    Create New Public Room
                </button>

                {publicRoomsLoading ? (
                    <div className="loading">Loading public rooms...</div>
                ) : publicRooms.length === 0 ? (
                    <div className="no-data">No public rooms found</div>
                ) : (
                    <div className="public-rooms-container">
                        <table className="public-rooms-table">
                            <thead>
                                <tr>
                                    <th>Code</th>
                                    <th>Name</th>
                                    <th>Status</th>
                                    <th>Created At</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {publicRooms.map(room => (
                                    <tr key={room.code} className={room.active ? 'room-active' : 'room-inactive'}>
                                        <td>{room.code}</td>
                                        <td>{room.name}</td>
                                        <td>
                                            <span className={`status-badge ${room.active ? 'active' : 'inactive'}`}>
                                                {room.active ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>{formatDate(room.createdAt)}</td>
                                        <td className="actions">
                                            <button
                                                className="action-btn copy-code"
                                                onClick={() => copyToClipboard(room.code)}
                                                title="Copy room code"
                                            >
                                                Copy Code
                                            </button>
                                            <button
                                                className={`action-btn ${room.active ? 'deactivate' : 'activate'}`}
                                                onClick={() => handleToggleRoomStatus(room.code)}
                                            >
                                                {room.active ? 'Deactivate' : 'Activate'}
                                            </button>
                                            <button
                                                className="action-btn delete"
                                                onClick={() => handleDeletePublicRoom(room.code)}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {}
            {editingText && (
                <div className="modal-overlay">
                    <div className="modal edit-modal">
                        <h2>Edit Text (Code: {editingText.id})</h2>
                        <textarea
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={10}
                        />
                        <div className="modal-buttons">
                            <button className="Btn save" onClick={handleUpdateText}>Save</button>
                            <button className="Btn cancel" onClick={handleCancelEdit}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {}
            {showPasswordModal && (
                <div className="modal-overlay">
                    <div className="modal password-modal">
                        <h2>Change Admin Password</h2>
                        <form onSubmit={handleChangePassword}>
                            <div className="password-field">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="password-field">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="password-field">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            {passwordError && (
                                <div className="error-message">{passwordError}</div>
                            )}

                            <div className="modal-buttons">
                                <button type="submit" className="Btn save">Change Password</button>
                                <button
                                    type="button"
                                    className="Btn cancel"
                                    onClick={() => setShowPasswordModal(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {}
            {showCodeModal && (
                <div className="modal-overlay">
                    <div className="modal code-modal">
                        <h2>Edit Code</h2>
                        <div className="code-info">
                            <p>Current text: <span className="highlight">
                                {editingCode?.text.length > 50
                                    ? `${editingCode?.text.substring(0, 50)}...`
                                    : editingCode?.text}
                            </span></p>
                            <p>Current code: <span className="highlight">{editingCode?.id}</span></p>
                        </div>

                        <div className="code-field">
                            <label>New Code (4 digits)</label>
                            <input
                                type="text"
                                value={newCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setNewCode(value);
                                }}
                                onBlur={handleCheckCodeAvailability}
                                maxLength={4}
                                pattern="\d{4}"
                                placeholder="Enter a 4-digit code"
                                required
                                className="code-input"
                            />
                        </div>

                        {codeError && (
                            <div className="error-message">{codeError}</div>
                        )}

                        <div className="modal-buttons">
                            <button
                                type="button"
                                className="Btn save"
                                onClick={handleUpdateCode}
                                disabled={!newCode || newCode.length !== 4 || codeError}
                            >
                                Update Code
                            </button>
                            <button
                                type="button"
                                className="Btn cancel"
                                onClick={handleCancelCodeEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showImageCodeModal && (
                <div className="modal-overlay">
                    <div className="modal code-modal">
                        <h2>Edit Image Code</h2>
                        <div className="code-info">
                            <p>Current file: <span className="highlight">
                                {editingImage?.originalName || 'Shared image'}
                            </span></p>
                            <p>Current code: <span className="highlight">{editingImage?.id}</span></p>
                        </div>

                        <div className="code-field">
                            <label>New Code (4 digits)</label>
                            <input
                                type="text"
                                value={newImageCode}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                    setNewImageCode(value);
                                }}
                                onBlur={handleCheckImageCodeAvailability}
                                maxLength={4}
                                pattern="\d{4}"
                                placeholder="Enter a 4-digit code"
                                required
                                className="code-input"
                            />
                        </div>

                        {imageCodeError && (
                            <div className="error-message">{imageCodeError}</div>
                        )}

                        <div className="modal-buttons">
                            <button
                                type="button"
                                className="Btn save"
                                onClick={handleUpdateImageCode}
                                disabled={!newImageCode || newImageCode.length !== 4 || imageCodeError}
                            >
                                Update Code
                            </button>
                            <button
                                type="button"
                                className="Btn cancel"
                                onClick={handleCancelImageCodeEdit}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {}
            {showPublicRoomModal && (
                <div className="modal-overlay">
                    <div className="modal public-room-modal">
                        <h2>Create New Public Room</h2>
                        <form onSubmit={handleCreatePublicRoom}>
                            <div className="room-field">
                                <label>Room Name (Optional)</label>
                                <input
                                    type="text"
                                    value={publicRoomName}
                                    onChange={(e) => setPublicRoomName(e.target.value)}
                                    placeholder="Enter a name for this room"
                                    className="room-name-input"
                                    maxLength={50}
                                />
                                <p className="room-info">
                                    A random 4-digit code will be generated automatically.<br />
                                    If no name is provided, a default name will be used.
                                </p>
                            </div>

                            <div className="modal-buttons">
                                <button type="submit" className="Btn save">Create Room</button>
                                <button
                                    type="button"
                                    className="Btn cancel"
                                    onClick={() => {
                                        setShowPublicRoomModal(false);
                                        setPublicRoomName('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;


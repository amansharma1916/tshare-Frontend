import React, { useState, useEffect } from 'react';
import './AdminPanel.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const AdminPanel = () => {
    const [texts, setTexts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingText, setEditingText] = useState(null);
    const [editedContent, setEditedContent] = useState('');
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showCodeModal, setShowCodeModal] = useState(false);
    const [editingCode, setEditingCode] = useState(null);
    const [newCode, setNewCode] = useState('');
    const [codeError, setCodeError] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [actionMessage, setActionMessage] = useState({ text: '', type: '' });

    // Check authentication status
    useEffect(() => {
        const isAuthenticated = sessionStorage.getItem('adminAuthenticated') === 'true';
        if (!isAuthenticated) {
            window.location.href = '/admin/login';
        }
        fetchTexts();
    }, []);

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

        // Validate the code
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
                // Update the text in the local state with the new code
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
                // Update the text in the local state with the new code
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

    return (
        <div className="admin-panel-container">
            <div className="nameBanner">
                {bannerText} <span className="admin-badge">Admin Panel</span>
            </div>

            <div className="admin-controls">
                <button className="Btn refresh" onClick={fetchTexts}>
                    Refresh Data
                </button>
                <button className="Btn delete-all" onClick={handleDeleteAllTexts}>
                    Delete All Texts
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
            </div>

            {/* Edit Modal */}
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

            {/* Change Password Modal */}
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

            {/* Edit Code Modal */}
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
                                    // Only allow digits and limit to 4 characters
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
        </div>
    );
};

export default AdminPanel;

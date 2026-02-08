import React, { useState } from 'react';
import './AdminLogin.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const AdminLogin = () => {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();

        if (!password.trim()) {
            setError('Please enter the admin password');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(endpoints.adminLogin, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (data.success) {
                sessionStorage.setItem('adminAuthenticated', 'true');
                window.location.href = '/admin/panel';
            } else {
                setError(data.message || 'Invalid password');
            }
        } catch (error) {
            console.error('Error:', error);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-login-container">
            <div className="nameBanner">
                {bannerText} <span className="admin-badge">Admin</span>
            </div>

            <div className="admin-login-box">
                <h1>Admin Login</h1>

                <form onSubmit={handleLogin}>
                    <div className="password-field">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter admin password"
                            autoFocus
                        />
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <div className="admin-buttons">
                        <button
                            className="Btn"
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                        <button
                            className="Btn secondary"
                            type="button"
                            onClick={() => (window.location.href = '/')}
                        >
                            Back to Home
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminLogin;


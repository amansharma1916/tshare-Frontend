import React, { useState, useEffect } from 'react';
import './SharePage.css';
import bannerText from './bannerText';
import { endpoints, baseUrl } from '../api/api';
import io from 'socket.io-client';

const SharePage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io(baseUrl);
    setSocket(newSocket);

    return () => {
      if (newSocket) newSocket.disconnect();
    };
  }, []);

  const saveTextDb = () => {
    const text = document.getElementById('sharePageInput').value;
    if (!text.trim()) {
      alert('Please enter some text to share');
      return;
    }

    setLoading(true);

    fetch(endpoints.save, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    })
      .then(res => res.json())
      .then(data => {
        setCode(data.id);
        document.getElementById('sharePageInput').value = '';

        if (socket) {
          socket.emit('text-update', {
            textId: data.id,
            text: text
          });
        }
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to share text. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const copyCode = () => {
    if (!code) return;

    navigator.clipboard.writeText(code)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };

  return (
    <div>
      <div className="nameBanner">
        {bannerText}
      </div>
      <div className="shareMain">
        <div className="textBox">
          <div className="code">
            {code ? (
              <>
                <h1>Your Code</h1>
                <div onClick={copyCode} style={{
                  cursor: 'pointer',
                  marginTop: '10px',
                  background: 'rgba(0,0,0,0.2)',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontSize: '1.3rem',
                  fontFamily: 'Source Code Pro, monospace',
                  color: '#6C63FF',
                  display: 'inline-block'
                }}>
                  {code} {copied ? '✓' : '📋'}
                </div>
              </>
            ) : (
              <h1>Share Text Securely</h1>
            )}
          </div>

          <textarea
            className="input"
            id="sharePageInput"
            placeholder="Enter text you want to share..."
            rows={10}
          />

          <div className="buttons-container">
            <button
              className="Btn"
              id="sharePageBtn"
              onClick={saveTextDb}
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Share'}
            </button>

            <button
              className="Btn image-share-btn"
              onClick={() => { window.location.href = '/share-image'; }}
            >
              Share Image
            </button>

            <button
              className="Btn"
              id="backBtn"
              onClick={() => { window.location.href = '/'; }}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SharePage;


import React, { useState, useRef } from 'react';
import './RecievePage.css';
import bannerText from './bannerText';
import { endpoints } from '../api/api';

const RecievePage = () => {
  const [receivedData, setReceivedData] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const receiveData = () => {
    const code = inputRef.current.value.trim();
    if (!code) {
      setError('Please enter a code');
      return;
    }

    setLoading(true);
    setError('');

    fetch(endpoints.get(code))
      .then(res => {
        if (!res.ok) {
          throw new Error('Invalid code or content not found');
        }
        return res.json();
      })
      .then(data => {
        if (data && data.text) {
          const unescapedText = data.text
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\');
          setReceivedData(unescapedText);
        } else {
          setError('No data found for this code');
        }
      })
      .catch(error => {
        console.error('Error:', error);
        setError(error.message || 'Failed to retrieve data');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const copyToClipboard = () => {
    if (!receivedData) return;

    navigator.clipboard.writeText(receivedData)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(error => {
        console.error('Error copying:', error);
      });
  };

  return (
    <div>
      <div className="nameBanner">
        {bannerText}
      </div>

      <div className="receiveMain">
        <div className="receiveContainer">
          <div className="receivedData">
            <h1>Received Data</h1>
            {/* Here we ensure newlines are respected by using <pre> */}
            <pre className="data">
              {receivedData || 'Enter a code below to fetch shared content...'}
            </pre>
          </div>

          <div className="input-group">
            <input
              type="text"
              placeholder="Enter the share code..."
              ref={inputRef}
              onChange={() => error && setError('')}
            />
            {error && (
              <div style={{
                color: '#ff6b6b',
                fontSize: '0.9rem',
                marginTop: '0.5rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}
          </div>

          <div className="buttons-container">
            {receivedData && (
              <button
                className={`Btn ${copied ? 'copied' : ''}`}
                id="copyBtn"
                onClick={copyToClipboard}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            )}

            <button
              className="Btn"
              id="recievePageBtn"
              onClick={receiveData}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Receive'}
            </button>

            <button
              className="Btn"
              id="backBtn"
              onClick={() => (window.location.href = '/')}
            >
              Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecievePage;

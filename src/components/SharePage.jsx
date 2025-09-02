import React, { useState } from 'react';
import './SharePage.css';
import bannerText from './bannerText';

const SharePage = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false); 

  const saveTextDb = () => {
    const text = document.getElementById('sharePageInput').value;
    setLoading(true); 

    fetch('https://tshare-backend.vercel.app/save', {
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
        alert('Text Shared Successfully');
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to share text.');
      })
      .finally(() => {
        setLoading(false); // stop loading
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
            <h1>Your Code : {code}</h1>
          </div>
          <textarea
            className="input"
            id="sharePageInput"
            placeholder="Input Text"
            rows={10}
          />
          <button
            className="Btn"
            id="sharePageBtn"
            onClick={saveTextDb}
            disabled={loading} 
          >
            {loading ? 'Sharing...' : 'Share'}
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
  );
};

export default SharePage;

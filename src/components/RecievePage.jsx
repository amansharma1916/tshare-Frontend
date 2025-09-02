import React, { useState } from 'react';
import './RecievePage.css';
import bannerText from './bannerText';
const RecievePage = () => {
  const [recievedData, setRecievedData] = useState('');

  const recieveData = () => {
    const code = document.querySelector('input').value;
    fetch(`https://tshare-backend.vercel.app/get/${code}`)
      .then(res => res.json())
      .then(data => {
        const unescapedText = data.text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
        setRecievedData(unescapedText);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      {/* Text banner at the top */}
      <div className="nameBanner">
        {bannerText} 
      </div>

      <div className="recieveMain">
        <div className="recievedData">
          <h1>Recieved Data :</h1>
          <pre className="data">{recievedData}</pre>
        </div>

        <input type="text" placeholder="Enter Code" />

        <button
          className="Btn"
          id="copyBtn"
          onClick={() =>
            navigator.clipboard.writeText(recievedData).then(() => alert('Copied to clipboard'))
          }
        >
          Copy
        </button>

        <button className="Btn" id="recievePageBtn" onClick={recieveData}>
          Recieve
        </button>

        <button className="Btn" id="backBtn" onClick={() => (window.location.href = '/')}>
          Back
        </button>
      </div>
    </div>
  );
};

export default RecievePage;

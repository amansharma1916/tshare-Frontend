import React, { useState } from 'react';
import './RecievePage.css';

const RecievePage = () => {
  const [recievedData, setRecievedData] = useState('');

  const recieveData = () => {
    const code = document.querySelector('input').value;
    fetch(`https://tshare-backend.onrender.com/get/${code}`)
      .then(res => res.json())
      .then(data => {
        // Unescape newline characters if returned as literal "\n"
        const unescapedText = data.text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\\\/g, '\\');
        setRecievedData(unescapedText);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  };

  return (
    <div>
      <div className="recieveMain">
        <div className="recievedData">
          <h1>Recieved Data :</h1>
          {/* Use a div with CSS white-space or <pre> tag to preserve formatting */}
          <pre className="data">
            {recievedData}
          </pre>
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

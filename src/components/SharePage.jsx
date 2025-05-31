import React from 'react'
import './SharePage.css'
import { useState } from 'react'





const SharePage = () => {
  const [code , setCode] = useState('')
  const saveTextDb = () => {
      const text = document.getElementById('sharePageInput').value
      fetch('https://tshare-backend.onrender.com/save', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({text})
      })
      .then(res => res.json())
      .then(data => {
          setCode(data.id);
          document.getElementById('sharePageInput').value = '';
          alert("Text Shared Successfully");
      })
      .catch(error => {
          console.error('Error:', error);
      });
  }
  return (
    <div>
      <div className="shareMain">
        <div className="textBox">
            <div className="code">
              <h1>Your Code : {code}</h1>
            </div>
            <input type="text" className='input' id='sharePageInput' placeholder='Input Text'/>
            <button className='Btn' id='sharePageBtn' onClick={saveTextDb}>Share</button>
            <button className='Btn' id='backBtn' onClick={()=>{window.location.href = '/'}}>Back</button>
        </div>
      </div>
    </div>
  )
}

export default SharePage

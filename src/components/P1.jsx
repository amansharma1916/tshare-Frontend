import React from 'react'
import './p1.css'
import bannerText from './bannerText';

const P1 = () => {
  const sharePage = () => {
    window.location.href = '/sharePage'
  }

  return (
    <div className="p1">
      {/* Added div showing your name at the top */}
      <div className="nameBanner">
        {bannertext}
      </div>
      
      <div className="mainBox">
        <div className="shareBox" onClick={sharePage}>
          <button className='Btn' id='shareBtn' onClick={sharePage}>Share</button>
        </div>
        <div className="recieve" onClick={() => { window.location.href = '/recievePage' }}>
          <button className='Btn' id='recieveBtn' onClick={() => { window.location.href = '/recievePage' }}>Recieve</button>
        </div>
      </div>
    </div>
  )
}

export default P1


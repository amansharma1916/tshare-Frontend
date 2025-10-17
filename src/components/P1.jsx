import React from 'react'
import './p1.css'
import bannerText from './bannerText';

const P1 = () => {
  const sharePage = () => {
    window.location.href = '/sharePage'
  }

  const receivePage = () => {
    window.location.href = '/recievePage'
  }

  const publicRoomPage = () => {
    window.location.href = '/public-room'
  }

  return (
    <div className="p1">
      <div className="nameBanner">
        {bannerText}
      </div>

      <div className="appLogo">TShare</div>

      <div className="mainBox">
        <div className="shareBox" onClick={sharePage} title="Share text with others">
          <button className='Btn' id='shareBtn' onClick={sharePage}>
            <span className="btn-text">Share</span>
          </button>
        </div>
        <div className="recieve" onClick={receivePage} title="Receive shared text">
          <button className='Btn' id='recieveBtn' onClick={receivePage}>
            <span className="btn-text">Receive</span>
          </button>
        </div>
      </div>

      <div className="publicRoomBtn">
        <button
          className='Btn publicRoom'
          onClick={publicRoomPage}
          title="Join a public chat room"
        >
          <span className="btn-text">Public Rooms</span>
        </button>
      </div>

      <div className="footer-text">
        Securely share and receive text with anyone
      </div>

      <div className="footer-links">
        <a href="/admin/login" title="Admin Panel" className="admin-link">Admin</a>
      </div>
    </div>
  )
}

export default P1


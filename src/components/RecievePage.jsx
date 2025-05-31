import React from 'react'
import './RecievePage.css'
import { useState } from 'react'
const RecievePage = () => {
    const [recievedData , setRecievedData] = useState('')
    const recieveData = () => {
        const code = document.querySelector('input').value
        fetch(`https://tshare-backend.onrender.com/get/${code}`)
        .then(res => res.json())
        .then(data => {
            setRecievedData(data.text);
        })
        .catch(error => {
            console.error('Error:', error);
        });
    }
  return (
    <div>
      <div className="recieveMain">
        <div className="recievedData">
          <h1>Recieved Data : </h1>
          <div className="data">
            {recievedData}
          </div>
        </div>
        <input type="text" placeholder='Enter Code' /> 
        <button className='Btn' id='copyBtn' onClick={() => navigator.clipboard.writeText(recievedData).then(() => alert('Copied to clipboard'))}>Copy</button>
        <button className='Btn' id='recievePageBtn' onClick={recieveData}>Recieve</button>
        <button className='Btn' id='backBtn' onClick={()=>{window.location.href = '/'}}>Back</button>
      </div>
    </div>
  )
}

export default RecievePage

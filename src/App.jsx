import React from 'react'
import './App.css'
import P1 from './components/P1.jsx'
import { Link, Routes, Route, NavLink, BrowserRouter } from 'react-router-dom'
import SharePage from './components/SharePage.jsx'
import ImageSharePage from './components/ImageSharePage.jsx'
import RecievePage from './components/RecievePage.jsx'
import AdminLogin from './components/AdminLogin.jsx'
import AdminPanel from './components/AdminPanel.jsx'
import PublicRoom from './components/publicArea/PublicRoom.jsx'

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path='/' element={<P1 />}></Route>
          <Route path='/sharePage' element={<SharePage />}></Route>
          <Route path='/share-image' element={<ImageSharePage />}></Route>
          <Route path='/recievePage' element={<RecievePage />}></Route>
          <Route path='/admin/login' element={<AdminLogin />}></Route>
          <Route path='/admin/panel' element={<AdminPanel />}></Route>
          <Route path='/public-room' element={<PublicRoom />}></Route>
        </Routes>
      </BrowserRouter>

    </>
  )
}

export default App

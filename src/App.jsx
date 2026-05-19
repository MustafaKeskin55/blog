import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Editor from './pages/Editor'
import Blog from './pages/Blog'
import Post from './pages/Post'
import Admin from './pages/Admin'
import './styles/global.css'
import './pages/Home.css'
import './pages/Editor.css'
import './pages/Blog.css'
import './pages/Post.css'
import './pages/Admin.css'

export default function App() {
  const [lang, setLang] = useState('tr')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/editor" element={<Editor lang={lang} />} />
        {/* Admin URL gizli — navbar'da yok */}
        <Route path="/mk-admin-panel" element={<Admin />} />
        <Route path="/*" element={
          <>
            <Navbar lang={lang} setLang={setLang} />
            <Routes>
              <Route path="/" element={<Home lang={lang} />} />
              <Route path="/blog" element={<Blog lang={lang} />} />
              <Route path="/blog/post/:id" element={<Post lang={lang} />} />
            </Routes>
          </>
        } />
      </Routes>
    </BrowserRouter>
  )
}

import { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api'
import { buildPreviewDocument } from '../lib/editorPreview'
import CodeMirror from '@uiw/react-codemirror'
import { html } from '@codemirror/lang-html'
import { css } from '@codemirror/lang-css'
import { javascript } from '@codemirror/lang-javascript'
import { oneDark } from '@codemirror/theme-one-dark'
import './Editor.css'

const DEFAULT_TEMPLATES = {
  glassmorphism: {
    label: 'Glassmorphism Card', icon: 'fas fa-square', category: 'UI',
    html: `<div class="scene">
  <div class="glass-card">
    <div class="avatar">MK</div>
    <h2>Mustafa Keskin</h2>
    <p>Full Stack Developer</p>
    <div class="tags"><span>JavaScript</span><span>React</span><span>Go</span></div>
    <button class="hire-btn">Hire Me</button>
  </div>
</div>`,
    css: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif}
.scene{min-height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#0f0c29,#302b63,#24243e);position:relative;overflow:hidden}
.scene::before,.scene::after{content:'';position:absolute;width:300px;height:300px;border-radius:50%;filter:blur(80px);opacity:.6}
.scene::before{background:#7c3aed;top:-80px;left:-80px}
.scene::after{background:#00d4ff;bottom:-80px;right:-80px}
.glass-card{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(20px);border-radius:24px;padding:3rem 2.5rem;text-align:center;color:#fff;position:relative;z-index:1;width:320px;box-shadow:0 25px 50px rgba(0,0,0,.3);transition:transform .3s}
.glass-card:hover{transform:translateY(-8px)}
.avatar{width:80px;height:80px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:1.6rem;font-weight:900;margin:0 auto 1.5rem}
h2{font-size:1.4rem;font-weight:700;margin-bottom:.4rem}
p{color:rgba(255,255,255,.6);font-size:.9rem;margin-bottom:1.5rem}
.tags{display:flex;gap:.5rem;justify-content:center;margin-bottom:2rem}
.tags span{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);padding:.3rem .8rem;border-radius:99px;font-size:.75rem}
.hire-btn{background:linear-gradient(135deg,#7c3aed,#00d4ff);border:none;color:#fff;padding:.75rem 2rem;border-radius:8px;cursor:pointer;font-size:.9rem;font-weight:600;width:100%;transition:opacity .2s}
.hire-btn:hover{opacity:.85}`,
    js: `const card=document.querySelector('.glass-card')
document.querySelector('.scene').addEventListener('mousemove',e=>{
  const r=card.getBoundingClientRect()
  const dx=(e.clientX-r.left-r.width/2)/20
  const dy=(e.clientY-r.top-r.height/2)/20
  card.style.transform=\`perspective(800px) rotateY(\${dx}deg) rotateX(\${-dy}deg) translateY(-8px)\`
})
document.querySelector('.scene').addEventListener('mouseleave',()=>{card.style.transform=''})`
  },
  navbar: {
    label: 'Animated Navbar', icon: 'fas fa-bars', category: 'Layout',
    html: `<nav>
  <div class="logo">MK<span>.</span></div>
  <ul>
    <li><a href="#" class="active">Home</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Projects</a></li>
    <li><a href="#">Blog</a></li>
  </ul>
  <button class="cta">Contact</button>
</nav>
<div class="hero-text"><h1>Modern Navbar</h1><p>Scroll down, hover the links</p></div>`,
    css: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#080b11;color:#e8edf5}
nav{display:flex;align-items:center;gap:2rem;padding:1.2rem 3rem;background:rgba(8,11,17,.8);backdrop-filter:blur(16px);border-bottom:1px solid #1e2a3a;position:sticky;top:0;z-index:100;transition:box-shadow .3s}
nav.scrolled{box-shadow:0 4px 30px rgba(0,212,255,.1)}
.logo{font-family:monospace;font-size:1.3rem;font-weight:900;color:#00d4ff;margin-right:auto}
.logo span{color:#7c3aed}
ul{list-style:none;display:flex;gap:.4rem}
ul a{padding:.5rem 1rem;border-radius:6px;font-size:.85rem;color:#5a6a8a;text-decoration:none;position:relative;transition:color .2s}
ul a::after{content:'';position:absolute;bottom:-2px;left:50%;right:50%;height:2px;background:#00d4ff;transition:all .3s}
ul a:hover,ul a.active{color:#e8edf5}
ul a:hover::after,ul a.active::after{left:10%;right:10%}
.cta{background:transparent;border:1px solid #00d4ff;color:#00d4ff;padding:.5rem 1.2rem;border-radius:6px;cursor:pointer;font-size:.82rem;font-family:monospace;transition:all .2s}
.cta:hover{background:rgba(0,212,255,.1)}
.hero-text{padding:6rem 3rem;text-align:center}
.hero-text h1{font-size:3rem;font-weight:900;letter-spacing:-2px;margin-bottom:1rem}
.hero-text p{color:#5a6a8a}`,
    js: `window.addEventListener('scroll',()=>{
  document.querySelector('nav').classList.toggle('scrolled',window.scrollY>20)
})`
  },
  neonbuttons: {
    label: 'Neon Buttons', icon: 'fas fa-hand-pointer', category: 'UI',
    html: `<div class="stage">
  <h1>Neon Button Pack</h1>
  <p>Hover each button</p>
  <div class="grid">
    <button class="btn btn-cyan">Cyan Glow</button>
    <button class="btn btn-purple">Purple Glow</button>
    <button class="btn btn-pink">Pink Glow</button>
    <button class="btn btn-green">Green Glow</button>
    <button class="btn btn-outline">Outline</button>
    <button class="btn btn-pulse">Pulse</button>
    <button class="btn btn-slide">Slide Fill</button>
    <button class="btn btn-gradient">Gradient</button>
  </div>
</div>`,
    css: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#080b11}
.stage{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2rem}
h1{color:#e8edf5;font-size:2rem;font-weight:900;letter-spacing:-1px}
p{color:#5a6a8a;font-family:monospace;font-size:.85rem}
.grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;width:420px}
.btn{padding:.85rem 1.5rem;border-radius:8px;font-size:.9rem;font-weight:700;cursor:pointer;font-family:'Inter',sans-serif;transition:all .25s;border:none}
.btn-cyan{background:#00d4ff;color:#080b11}
.btn-cyan:hover{box-shadow:0 0 25px #00d4ff,0 0 50px rgba(0,212,255,.4);transform:translateY(-3px)}
.btn-purple{background:#7c3aed;color:#fff}
.btn-purple:hover{box-shadow:0 0 25px #7c3aed,0 0 50px rgba(124,58,237,.4);transform:translateY(-3px)}
.btn-pink{background:#ff2d78;color:#fff}
.btn-pink:hover{box-shadow:0 0 25px #ff2d78,0 0 50px rgba(255,45,120,.4);transform:translateY(-3px)}
.btn-green{background:#00ff87;color:#080b11}
.btn-green:hover{box-shadow:0 0 25px #00ff87,0 0 50px rgba(0,255,135,.4);transform:translateY(-3px)}
.btn-outline{background:transparent;border:2px solid #00d4ff;color:#00d4ff}
.btn-outline:hover{background:rgba(0,212,255,.1);box-shadow:0 0 20px rgba(0,212,255,.4);transform:translateY(-3px)}
.btn-pulse{background:#7c3aed;color:#fff;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(124,58,237,.5)}50%{box-shadow:0 0 0 12px rgba(124,58,237,0)}}
.btn-slide{background:transparent;border:2px solid #ff2d78;color:#ff2d78;position:relative;overflow:hidden;z-index:0}
.btn-slide::before{content:'';position:absolute;inset:0;background:#ff2d78;transform:translateX(-101%);transition:transform .3s ease;z-index:-1}
.btn-slide:hover::before{transform:translateX(0)}
.btn-slide:hover{color:#fff}
.btn-gradient{background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#080b11}
.btn-gradient:hover{transform:translateY(-3px);box-shadow:0 8px 24px rgba(0,212,255,.3)}`,
    js: `document.querySelectorAll('.btn').forEach(btn=>{
  btn.addEventListener('click',function(e){
    const ripple=document.createElement('span')
    const rect=this.getBoundingClientRect()
    ripple.style.cssText=\`position:absolute;border-radius:50%;transform:scale(0);animation:ripple .5s linear;background:rgba(255,255,255,.4);width:80px;height:80px;left:\${e.clientX-rect.left-40}px;top:\${e.clientY-rect.top-40}px;pointer-events:none;\`
    this.style.position='relative';this.style.overflow='hidden'
    this.appendChild(ripple)
    setTimeout(()=>ripple.remove(),500)
  })
})
const s=document.createElement('style')
s.textContent='@keyframes ripple{to{transform:scale(3);opacity:0}}'
document.head.appendChild(s)`
  },
  loginform: {
    label: 'Login Form', icon: 'fas fa-sign-in-alt', category: 'Form',
    html: `<div class="wrapper">
  <div class="form-card">
    <div class="form-header">
      <div class="logo-icon"><i class="fas fa-code"></i></div>
      <h1>Sign In</h1>
      <p>Enter your credentials to continue</p>
    </div>
    <form id="loginForm">
      <div class="field" id="emailField">
        <label>Email</label>
        <div class="input-wrap">
          <i class="fas fa-envelope"></i>
          <input type="email" id="email" placeholder="hello@example.com"/>
        </div>
        <span class="err" id="emailErr"></span>
      </div>
      <div class="field" id="passField">
        <label>Password</label>
        <div class="input-wrap">
          <i class="fas fa-lock"></i>
          <input type="password" id="pass" placeholder="••••••••"/>
          <button type="button" class="eye" id="eye"><i class="fas fa-eye"></i></button>
        </div>
        <span class="err" id="passErr"></span>
      </div>
      <button type="submit" class="submit-btn"><span id="btnText">Sign In</span><i class="fas fa-arrow-right"></i></button>
    </form>
  </div>
</div>`,
    css: `@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#080b11}
.wrapper{min-height:100vh;display:flex;align-items:center;justify-content:center;background:radial-gradient(ellipse 60% 50% at 50% 40%,rgba(124,58,237,.2),transparent 70%);padding:2rem}
.form-card{background:#111722;border:1px solid #1e2a3a;border-radius:20px;padding:2.5rem;width:100%;max-width:400px}
.form-header{text-align:center;margin-bottom:2rem}
.logo-icon{width:56px;height:56px;border-radius:14px;margin:0 auto 1rem;background:linear-gradient(135deg,#7c3aed,#00d4ff);display:flex;align-items:center;justify-content:center;font-size:1.3rem;color:#080b11}
h1{color:#e8edf5;font-size:1.5rem;font-weight:800;margin-bottom:.4rem}
.form-header p{color:#5a6a8a;font-size:.88rem}
.field{margin-bottom:1.2rem}
label{display:block;font-size:.8rem;color:#5a6a8a;margin-bottom:.5rem}
.input-wrap{position:relative}
.input-wrap>i{position:absolute;left:1rem;top:50%;transform:translateY(-50%);color:#5a6a8a}
input{width:100%;padding:.85rem 1rem .85rem 2.8rem;background:#0e1117;border:1px solid #1e2a3a;border-radius:10px;color:#e8edf5;font-size:.9rem;outline:none;transition:border-color .2s}
input:focus{border-color:#7c3aed}
.field.error input{border-color:#ff2d78}
.eye{position:absolute;right:.8rem;top:50%;transform:translateY(-50%);background:none;border:none;color:#5a6a8a;cursor:pointer}
.err{font-size:.75rem;color:#ff2d78;margin-top:.4rem;display:block;min-height:1rem}
.submit-btn{width:100%;padding:.9rem;border-radius:10px;border:none;background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#080b11;font-size:.9rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:.5rem;transition:all .2s;margin-top:1rem}
.submit-btn:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.4)}`,
    js: `document.getElementById('eye').addEventListener('click',function(){
  const p=document.getElementById('pass')
  const isPass=p.type==='password'
  p.type=isPass?'text':'password'
  this.querySelector('i').className=isPass?'fas fa-eye-slash':'fas fa-eye'
})
document.getElementById('loginForm').addEventListener('submit',async e=>{
  e.preventDefault()
  let valid=true
  const email=document.getElementById('email').value
  const pass=document.getElementById('pass').value
  document.getElementById('emailErr').textContent=''
  document.getElementById('passErr').textContent=''
  document.getElementById('emailField').classList.remove('error')
  document.getElementById('passField').classList.remove('error')
  if(!email||!/^[^@]+@[^@]+\.[^@]+$/.test(email)){
    document.getElementById('emailErr').textContent='Enter a valid email.'
    document.getElementById('emailField').classList.add('error');valid=false
  }
  if(pass.length<6){
    document.getElementById('passErr').textContent='Min 6 characters.'
    document.getElementById('passField').classList.add('error');valid=false
  }
  if(!valid)return
  document.getElementById('btnText').textContent='Signing in...'
  await new Promise(r=>setTimeout(r,1500))
  document.getElementById('btnText').textContent='✓ Success!'
})`
  },
  pricing: {
    label: 'Pricing Cards', icon: 'fas fa-tags', category: 'UI',
    html: `<div class="pricing-page">
  <h1>Choose Your Plan</h1>
  <p class="sub">Simple, transparent pricing</p>
  <div class="cards">
    <div class="card">
      <div class="plan-name">Starter</div>
      <div class="price"><span class="currency">$</span>0<span class="period">/mo</span></div>
      <ul class="features">
        <li><i class="fas fa-check"></i>5 Projects</li>
        <li><i class="fas fa-check"></i>1 GB Storage</li>
        <li><i class="fas fa-check"></i>Community Support</li>
        <li class="off"><i class="fas fa-times"></i>Custom Domain</li>
      </ul>
      <button class="plan-btn plan-btn--ghost">Get Started</button>
    </div>
    <div class="card card--featured">
      <div class="badge">Most Popular</div>
      <div class="plan-name">Pro</div>
      <div class="price"><span class="currency">$</span>29<span class="period">/mo</span></div>
      <ul class="features">
        <li><i class="fas fa-check"></i>Unlimited Projects</li>
        <li><i class="fas fa-check"></i>50 GB Storage</li>
        <li><i class="fas fa-check"></i>Priority Support</li>
        <li><i class="fas fa-check"></i>Custom Domain</li>
      </ul>
      <button class="plan-btn">Get Pro</button>
    </div>
    <div class="card">
      <div class="plan-name">Enterprise</div>
      <div class="price"><span class="currency">$</span>99<span class="period">/mo</span></div>
      <ul class="features">
        <li><i class="fas fa-check"></i>Everything in Pro</li>
        <li><i class="fas fa-check"></i>500 GB Storage</li>
        <li><i class="fas fa-check"></i>24/7 Support</li>
        <li><i class="fas fa-check"></i>SLA Guarantee</li>
      </ul>
      <button class="plan-btn plan-btn--ghost">Contact Sales</button>
    </div>
  </div>
</div>`,
    css: `@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#080b11;color:#e8edf5}
.pricing-page{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:3rem 2rem;gap:1rem}
h1{font-size:2.5rem;font-weight:900;letter-spacing:-1px}
.sub{color:#5a6a8a;margin-bottom:2rem}
.cards{display:flex;gap:1.5rem;align-items:stretch;flex-wrap:wrap;justify-content:center}
.card{background:#111722;border:1px solid #1e2a3a;border-radius:20px;padding:2rem;width:260px;display:flex;flex-direction:column;gap:1.5rem;transition:transform .2s,border-color .2s;position:relative}
.card:hover{border-color:rgba(0,212,255,.3);transform:translateY(-4px)}
.card--featured{background:linear-gradient(135deg,rgba(124,58,237,.15),rgba(0,212,255,.05));border-color:#7c3aed;transform:scale(1.05)}
.card--featured:hover{transform:scale(1.05) translateY(-4px)}
.badge{position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#080b11;font-size:.72rem;font-weight:700;padding:.3rem 1rem;border-radius:99px;white-space:nowrap}
.plan-name{font-family:monospace;font-size:.82rem;color:#5a6a8a;letter-spacing:2px;text-transform:uppercase}
.price{font-size:3rem;font-weight:900;letter-spacing:-2px}
.currency{font-size:1.5rem;vertical-align:super;margin-right:.2rem;color:#5a6a8a}
.period{font-size:.9rem;color:#5a6a8a;font-weight:400}
.features{list-style:none;display:flex;flex-direction:column;gap:.7rem;flex:1}
.features li{font-size:.88rem;color:#e8edf5;display:flex;align-items:center;gap:.6rem}
.features li i{color:#00ff87;font-size:.75rem}
.features li.off{color:#5a6a8a}
.features li.off i{color:#5a6a8a}
.plan-btn{padding:.85rem;border-radius:10px;font-size:.88rem;font-weight:700;cursor:pointer;border:none;background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#080b11;transition:all .2s}
.plan-btn:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,212,255,.3)}
.plan-btn--ghost{background:transparent;border:1px solid #1e2a3a;color:#e8edf5}
.plan-btn--ghost:hover{border-color:#7c3aed;color:#a78bfa;box-shadow:none}`,
    js: `document.querySelectorAll('.plan-btn').forEach(btn=>{
  btn.addEventListener('click',function(){
    const orig=this.textContent
    this.textContent='✓ Selected!'
    this.style.background='#00ff87'
    this.style.color='#080b11'
    setTimeout(()=>{
      this.textContent=orig
      this.style.background=''
      this.style.color=''
    },2000)
  })
})`
  },
  reactcounter: {
    label: 'React Counter', icon: 'fab fa-react', category: 'React', react: true, deps: '',
    html: `<div id="root"></div>`,
    css: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#080b11;min-height:100vh}
.app{min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;color:#e8edf5}
h1{font-size:1.6rem;font-weight:800}
.count{font-size:3.5rem;font-weight:900;font-family:monospace;color:#00d4ff}
.actions{display:flex;gap:.6rem}
button{padding:.7rem 1.4rem;border-radius:8px;border:none;font-weight:700;cursor:pointer;font-size:.9rem;transition:transform .15s,box-shadow .15s}
button:hover{transform:translateY(-2px)}
.btn-inc{background:linear-gradient(135deg,#7c3aed,#00d4ff);color:#080b11}
.btn-dec{background:#111722;color:#e8edf5;border:1px solid #1e2a3a}
.btn-reset{background:transparent;color:#5a6a8a;border:1px dashed #1e2a3a}`,
    js: `import { useState } from 'react'
import { createRoot } from 'react-dom/client'

function App() {
  const [count, setCount] = useState(0)
  return (
    <div className="app">
      <h1>React Counter</h1>
      <div className="count">{count}</div>
      <div className="actions">
        <button className="btn-dec" onClick={() => setCount(c => c - 1)}>−</button>
        <button className="btn-reset" onClick={() => setCount(0)}>Reset</button>
        <button className="btn-inc" onClick={() => setCount(c => c + 1)}>+</button>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)`
  },
  reactmotion: {
    label: 'React + Motion', icon: 'fab fa-react', category: 'React', react: true, deps: 'framer-motion',
    html: `<div id="root"></div>`,
    css: `*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Inter',sans-serif;background:#080b11;min-height:100vh}
.stage{min-height:100vh;display:flex;align-items:center;justify-content:center}
.card{background:linear-gradient(135deg,rgba(124,58,237,.25),rgba(0,212,255,.12));border:1px solid rgba(0,212,255,.25);border-radius:20px;padding:2.5rem 3rem;text-align:center;color:#e8edf5}
.card h2{font-size:1.4rem;margin-bottom:.5rem}
.card p{color:#5a6a8a;font-size:.9rem}`,
    js: `import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { motion } from 'framer-motion'

function App() {
  const [on, setOn] = useState(false)
  return (
    <div className="stage">
      <motion.div
        className="card"
        animate={{ scale: on ? 1.08 : 1, rotate: on ? 2 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        onClick={() => setOn(v => !v)}
        style={{ cursor: 'pointer' }}
      >
        <h2>Framer Motion</h2>
        <p>{on ? 'Animasyon açık — tekrar tıkla' : 'Kartı tıkla'}</p>
      </motion.div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(<App />)`
  }
}

function buildTemplates(custom = []) {
  const base = { ...DEFAULT_TEMPLATES }
  custom.forEach(t => { base[`custom_${t.id}`] = t })
  return base
}

export default function Editor({ lang }) {
  const [templates, setTemplates] = useState(() => buildTemplates())
  const [activeTemplate, setActiveTemplate] = useState('glassmorphism')
  const [htmlCode, setHtmlCode] = useState(DEFAULT_TEMPLATES.glassmorphism.html)
  const [cssCode, setCssCode] = useState(DEFAULT_TEMPLATES.glassmorphism.css)
  const [jsCode, setJsCode] = useState(DEFAULT_TEMPLATES.glassmorphism.js)
  const [activeTab, setActiveTab] = useState('html')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [splitV, setSplitV] = useState(false)
  const [copied, setCopied] = useState(false)
  const [mobileView, setMobileView] = useState('editor') // 'editor' | 'preview' | 'templates'
  const [tplDrawer, setTplDrawer] = useState(false)
  const [previewMode, setPreviewMode] = useState('vanilla') // vanilla | react
  const [npmDeps, setNpmDeps] = useState('')
  const iframeRef = useRef()

  useEffect(() => {
    api.getTemplates()
      .then(custom => setTemplates(buildTemplates(custom)))
      .catch(() => {})
  }, [])

  const run = () => {
    if (!iframeRef.current) return
    iframeRef.current.srcdoc = buildPreviewDocument({
      html: htmlCode,
      css: cssCode,
      js: jsCode,
      mode: previewMode,
      deps: npmDeps,
    })
  }
  useEffect(() => { run() }, [htmlCode, cssCode, jsCode, previewMode, npmDeps])

  const loadTemplate = (key) => {
    const t = templates[key]
    setActiveTemplate(key)
    setHtmlCode(t.html); setCssCode(t.css); setJsCode(t.js)
    setPreviewMode(t.react ? 'react' : 'vanilla')
    setNpmDeps(t.deps || '')
    setTplDrawer(false)
    setMobileView('editor')
  }

  const copy = () => {
    const map = { html: htmlCode, css: cssCode, js: jsCode }
    navigator.clipboard.writeText(map[activeTab])
    setCopied(true); setTimeout(() => setCopied(false), 1500)
  }

  const langMap = {
    html: html(),
    css: css(),
    js: javascript(previewMode === 'react' ? { jsx: true, typescript: true } : {}),
  }
  const categories = [...new Set(Object.values(templates).map(t => t.category))]

  const T = lang === 'tr'
    ? {
        code: 'Editör', copyBtn: copied ? 'Kopyalandı!' : 'Kopyala', run: 'Çalıştır',
        preview: 'Önizleme', templates: 'Şablonlar', vanilla: 'HTML', react: 'React',
        deps: 'Kütüphaneler', depsPh: 'framer-motion, lodash-es',
        depsHint: 'esm.sh — virgülle ayır',
      }
    : {
        code: 'Editor', copyBtn: copied ? 'Copied!' : 'Copy', run: 'Run',
        preview: 'Preview', templates: 'Templates', vanilla: 'HTML', react: 'React',
        deps: 'Packages', depsPh: 'framer-motion, lodash-es',
        depsHint: 'esm.sh — comma separated',
      }

  return (
    <div className={`editor-page ${isFullscreen ? 'fullscreen' : ''}`}>

      {/* DESKTOP TOP BAR */}
      <div className="editor-topbar">
        <div className="editor-tabs-main">
          <button className="main-tab active">
            <i className="fas fa-code"/> {T.code}
          </button>
        </div>
        <div className="editor-actions">
          <button className="action-btn" onClick={copy} title={T.copyBtn}><i className={`fas fa-${copied ? 'check' : 'copy'}`}/></button>
          <button className="action-btn desktop-only" onClick={() => setSplitV(v => !v)} title="Layout"><i className="fas fa-columns"/></button>
          <button className="action-btn" onClick={() => setIsFullscreen(f => !f)} title="Fullscreen"><i className={`fas fa-${isFullscreen ? 'compress' : 'expand'}`}/></button>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="editor-mobile-nav">
        <button className={mobileView === 'editor' ? 'active' : ''} onClick={() => setMobileView('editor')}>
          <i className="fas fa-code"/><span>Kod</span>
        </button>
        <button className={mobileView === 'preview' ? 'active' : ''} onClick={() => setMobileView('preview')}>
          <i className="fas fa-play"/><span>Önizle</span>
        </button>
        <button className={tplDrawer ? 'active' : ''} onClick={() => setTplDrawer(d => !d)}>
          <i className="fas fa-layer-group"/><span>Şablonlar</span>
        </button>
        <button onClick={copy}>
          <i className={`fas fa-${copied ? 'check' : 'copy'}`}/><span>{copied ? 'Kopyalandı' : 'Kopyala'}</span>
        </button>
      </div>

      {/* TEMPLATE DRAWER (mobile) */}
      {tplDrawer && (
        <div className="tpl-drawer-overlay" onClick={() => setTplDrawer(false)}>
          <div className="tpl-drawer" onClick={e => e.stopPropagation()}>
            <div className="tpl-drawer-header">
              <span><i className="fas fa-layer-group"/> {T.templates}</span>
              <button onClick={() => setTplDrawer(false)}><i className="fas fa-times"/></button>
            </div>
            <div className="tpl-drawer-body">
              {categories.map(cat => (
                <div key={cat}>
                  <div className="tpl-cat-label">{cat}</div>
                  {Object.entries(templates).filter(([,t]) => t.category === cat).map(([key, t]) => (
                    <button key={key} className={`tpl-item ${activeTemplate === key ? 'active' : ''}`} onClick={() => loadTemplate(key)}>
                      <i className={t.icon}/> {t.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* EDITOR BODY */}
      <div className="editor-body">
        <div className={`editor-left ${splitV ? 'split-v' : ''} ${mobileView === 'editor' ? 'mobile-active' : 'mobile-hidden'}`}>
          {/* Template sidebar (desktop only) */}
          <div className="template-sidebar">
            <div className="tpl-section-label">Templates</div>
            {categories.map(cat => (
              <div key={cat}>
                <div className="tpl-cat-label">{cat}</div>
                {Object.entries(templates).filter(([,t]) => t.category === cat).map(([key, t]) => (
                  <button key={key} className={`tpl-item ${activeTemplate === key ? 'active' : ''}`} onClick={() => loadTemplate(key)}>
                    <i className={t.icon}/> {t.label}
                  </button>
                ))}
              </div>
            ))}
          </div>

          {/* Code panel */}
          <div className="editor-panel">
            <div className="tab-bar">
              {['html', 'css', 'js'].map(tab => (
                <button key={tab} className={`tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  <i className={tab === 'html' ? 'fab fa-html5' : tab === 'css' ? 'fab fa-css3-alt' : 'fab fa-js'}/>
                  {tab.toUpperCase()}
                  <span className="line-count">{(tab === 'html' ? htmlCode : tab === 'css' ? cssCode : jsCode).split('\n').length}L</span>
                </button>
              ))}
            </div>
            <div className="cm-wrap">
              {activeTab === 'html' && <CodeMirror value={htmlCode} onChange={setHtmlCode} extensions={[langMap.html]} theme={oneDark} height="100%" basicSetup={{ lineNumbers: true, foldGutter: true }}/>}
              {activeTab === 'css' && <CodeMirror value={cssCode} onChange={setCssCode} extensions={[langMap.css]} theme={oneDark} height="100%" basicSetup={{ lineNumbers: true }}/>}
              {activeTab === 'js' && <CodeMirror value={jsCode} onChange={setJsCode} extensions={[langMap.js]} theme={oneDark} height="100%" basicSetup={{ lineNumbers: true }}/>}
            </div>
          </div>
        </div>

        {/* RIGHT: preview */}
        <div className={`editor-right ${mobileView === 'preview' ? 'mobile-active' : mobileView === 'editor' ? 'mobile-hidden' : 'mobile-hidden'}`}>
          <div className="preview-bar">
            <span className="preview-label">
              <i className="fas fa-circle" style={{color:'#28c840',fontSize:'.55rem'}}/>
              <i className="fas fa-circle" style={{color:'#febc2e',fontSize:'.55rem'}}/>
              <i className="fas fa-circle" style={{color:'#ff5f57',fontSize:'.55rem'}}/>
              &nbsp; {T.preview}
            </span>
            <div className="preview-controls">
              <div className="preview-mode">
                <button type="button" className={previewMode === 'vanilla' ? 'active' : ''} onClick={() => setPreviewMode('vanilla')}>{T.vanilla}</button>
                <button type="button" className={previewMode === 'react' ? 'active' : ''} onClick={() => setPreviewMode('react')}><i className="fab fa-react"/> {T.react}</button>
              </div>
              {previewMode === 'react' && (
                <label className="preview-deps" title={T.depsHint}>
                  <span>{T.deps}</span>
                  <input
                    type="text"
                    value={npmDeps}
                    onChange={e => setNpmDeps(e.target.value)}
                    placeholder={T.depsPh}
                    spellCheck={false}
                  />
                </label>
              )}
              <button className="run-btn" onClick={run}><i className="fas fa-play"/> {T.run}</button>
            </div>
          </div>
          <iframe ref={iframeRef} className="preview-frame" title="preview" sandbox="allow-scripts allow-forms allow-modals allow-popups"/>
        </div>
      </div>
    </div>
  )
}

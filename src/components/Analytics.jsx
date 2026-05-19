import { Link } from 'react-router-dom'
import './Analytics.css'

// GA4 measurement ID buraya girilecek
const GA_ID = 'G-XXXXXXXXXX'

export default function Analytics({ lang = 'tr' }) {
  const T = {
    tr: {
      title: 'Site Analitiği',
      sub: 'Google Analytics 4 ile bağlı',
      setup: 'GA4 Kurulum Adımları',
      step1: '1. Google Analytics hesabı aç',
      step2: '2. Yeni bir GA4 property oluştur',
      step3: '3. Measurement ID\'yi (G-XXXXXXX) kopyala',
      step4: '4. index.html\'e script ekle (aşağıda)',
      step5: '5. Vercel\'e deploy et — 24 saat içinde veri gelmeye başlar',
      realtime: 'Gerçek Zamanlı Veri',
      realtimeSub: 'GA4 paneline git',
      metrics: 'Hangi Metriklere Bakacaksın?',
      m1: 'Aktif Kullanıcılar',
      m2: 'Sayfa Görüntüleme',
      m3: 'Ortalama Oturum Süresi',
      m4: 'Hemen Çıkma Oranı',
      m5: 'Trafik Kaynakları',
      m6: 'Coğrafi Dağılım',
      note: 'Not',
      noteText: 'GA4 verileri tarayıcıda değil Google sunucularında tutulur. Localhost\'ta çalışırken veri gelmez — Vercel\'e deploy ettikten sonra görürsün.',
    },
    en: {
      title: 'Site Analytics',
      sub: 'Connected with Google Analytics 4',
      setup: 'GA4 Setup Steps',
      step1: '1. Create a Google Analytics account',
      step2: '2. Create a new GA4 property',
      step3: '3. Copy your Measurement ID (G-XXXXXXX)',
      step4: '4. Add the script to index.html (see below)',
      step5: '5. Deploy to Vercel — data starts flowing within 24h',
      realtime: 'Real-Time Data',
      realtimeSub: 'Go to GA4 dashboard',
      metrics: 'Key Metrics to Track',
      m1: 'Active Users',
      m2: 'Page Views',
      m3: 'Avg. Session Duration',
      m4: 'Bounce Rate',
      m5: 'Traffic Sources',
      m6: 'Geographic Distribution',
      note: 'Note',
      noteText: 'GA4 data is stored on Google servers, not in the browser. No data appears on localhost — you\'ll see it after deploying to Vercel.',
    }
  }
  const t = T[lang]

  const snippet = `<!-- Google Analytics 4 — index.html <head> içine ekle -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${GA_ID}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${GA_ID}');
</script>`

  const metrics = [t.m1, t.m2, t.m3, t.m4, t.m5, t.m6]
  const icons = ['fas fa-users', 'fas fa-eye', 'fas fa-clock', 'fas fa-sign-out-alt', 'fas fa-share-alt', 'fas fa-globe']

  return (
    <div className="analytics-page">
      <div className="an-header">
        <div className="an-title-row">
          <div className="an-icon"><i className="fab fa-google" /></div>
          <div>
            <h2>{t.title}</h2>
            <p>{t.sub}</p>
          </div>
        </div>
      </div>

      <div className="an-body">
        {/* Setup steps */}
        <div className="an-card">
          <h3><i className="fas fa-list-check" /> {t.setup}</h3>
          <div className="steps">
            {[t.step1, t.step2, t.step3, t.step4, t.step5].map((s, i) => (
              <div key={i} className="step-item">
                <div className="step-num">{i + 1}</div>
                <span>{s.replace(/^\d+\. /, '')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code snippet */}
        <div className="an-card">
          <h3><i className="fas fa-code" /> index.html Script</h3>
          <div className="code-block">
            <button className="copy-code-btn" onClick={() => navigator.clipboard.writeText(snippet)}>
              <i className="fas fa-copy" /> Copy
            </button>
            <pre>{snippet}</pre>
          </div>
        </div>

        {/* Metrics grid */}
        <div className="an-card">
          <h3><i className="fas fa-chart-bar" /> {t.metrics}</h3>
          <div className="metrics-grid">
            {metrics.map((m, i) => (
              <div key={m} className="metric-pill">
                <i className={icons[i]} />
                <span>{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* GA4 Link */}
        <div className="an-card an-card--cta">
          <i className="fas fa-external-link-alt" />
          <div>
            <h3>{t.realtime}</h3>
            <p>{t.realtimeSub}</p>
          </div>
          <a href="https://analytics.google.com" target="_blank" rel="noopener" className="btn-sm">
            analytics.google.com <i className="fas fa-arrow-right" />
          </a>
        </div>

        {/* Note */}
        <div className="an-note">
          <i className="fas fa-info-circle" />
          <p><b>{t.note}:</b> {t.noteText}</p>
        </div>
      </div>
    </div>
  )
}

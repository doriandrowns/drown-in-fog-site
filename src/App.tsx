import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'

type Entry = {
  code: string
  title: string
  summary: string
}

const site = {
  brand: 'drown in fog',
  tagline: 'let the fog consume you',
  description:
    'an ambient archive of stretched memory, submerged melody, soft repetition, and nocturnal drift.',
  youtubeChannel: 'https://www.youtube.com/@drowninfog',
  featuredEmbed:
    'https://www.youtube.com/embed/uPp2n5cFC68?autoplay=0&controls=1&rel=0',
  contactEmail: 'hello@drowninfog.com',
}

const archiveEntries: Entry[] = [
  {
    code: 'df-001',
    title: 'stretched memory',
    summary: 'familiar material slowed until it feels less like a song and more like weather.',
  },
  {
    code: 'df-002',
    title: 'sleep drift',
    summary: 'longform pieces for late hours, dim rooms, headphones, and disappearing thoughts.',
  },
  {
    code: 'df-003',
    title: 'loop ritual',
    summary: 'repetition used as immersion. a phrase becomes a room. a room becomes a mood.',
  },
  {
    code: 'df-004',
    title: 'visual fragments',
    summary: 'minimal imagery, ghost text, and half-lit design elements supporting the world around the sound.',
  },
]

function useCursorField() {
  const x = useMotionValue(typeof window !== 'undefined' ? window.innerWidth / 2 : 500)
  const y = useMotionValue(typeof window !== 'undefined' ? window.innerHeight / 2 : 350)
  const smoothX = useSpring(x, { damping: 20, stiffness: 200, mass: 0.45 })
  const smoothY = useSpring(y, { damping: 20, stiffness: 200, mass: 0.45 })

  const [rawX, setRawX] = useState(typeof window !== 'undefined' ? window.innerWidth / 2 : 500)
  const [rawY, setRawY] = useState(typeof window !== 'undefined' ? window.innerHeight / 2 : 350)
  const [lagX, setLagX] = useState(rawX)
  const [lagY, setLagY] = useState(rawY)
  const rafRef = useRef<number | null>(null)
  const latestRef = useRef({ x: rawX, y: rawY })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      latestRef.current = { x: e.clientX, y: e.clientY }
      if (rafRef.current !== null) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = null
        setRawX(latestRef.current.x)
        setRawY(latestRef.current.y)
      })
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [x, y])

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setLagX((prev) => prev + (rawX - prev) * 0.06)
      setLagY((prev) => prev + (rawY - prev) * 0.06)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [rawX, rawY])

  return { smoothX, smoothY, rawX, rawY, lagX, lagY }
}

function WarpedMesh({ cx, cy, lagX, lagY, enabled }: { cx: number; cy: number; lagX: number; lagY: number; enabled: boolean }) {
  const width = 1000
  const height = 720
  const cols = 18
  const rows = 12

  const qcx = Math.round(cx / 10) * 10
  const qcy = Math.round(cy / 10) * 10
  const qlx = Math.round(lagX / 10) * 10
  const qly = Math.round(lagY / 10) * 10

  const nx = typeof window !== 'undefined' ? (qcx / window.innerWidth) * width : width / 2
  const ny = typeof window !== 'undefined' ? (qcy / window.innerHeight) * height : height / 2
  const lnx = typeof window !== 'undefined' ? (qlx / window.innerWidth) * width : width / 2
  const lny = typeof window !== 'undefined' ? (qly / window.innerHeight) * height : height / 2

  const { verticalPaths, horizontalPaths, highlightX, highlightY, shadowX, shadowY } = useMemo(() => {
    const warpPoint = (px: number, py: number) => {
      if (!enabled) return [px, py] as const
      const dx = px - nx
      const dy = py - ny
      const ldx = px - lnx
      const ldy = py - lny
      const dist = Math.sqrt(dx * dx + dy * dy) || 1
      const ldist = Math.sqrt(ldx * ldx + ldy * ldy) || 1
      const radius = 360
      const pull = 24 * Math.exp(-(dist * dist) / (2 * radius * radius))
      const ripple = Math.sin(dist / 70) * Math.exp(-dist / 420) * 3.5
      const inertiaPull = 9 * Math.exp(-(ldist * ldist) / (2 * (radius * 1.08) * (radius * 1.08)))
      const inertiaRipple = Math.sin(ldist / 78) * Math.exp(-ldist / 500) * 2.2
      const bendX = px - (dx / dist) * pull - (ldx / ldist) * inertiaPull + ripple * (dx / dist) + inertiaRipple * (ldx / ldist)
      const bendY = py - (dy / dist) * pull - (ldy / ldist) * inertiaPull + ripple * (dy / dist) + inertiaRipple * (ldy / ldist)
      return [bendX, bendY] as const
    }

    const smoothPath = (points: Array<readonly [number, number]>) => {
      let d = `M${points[0][0].toFixed(2)},${points[0][1].toFixed(2)}`
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i - 1] || points[i]
        const p1 = points[i]
        const p2 = points[i + 1]
        const p3 = points[i + 2] || p2
        const cp1x = p1[0] + (p2[0] - p0[0]) / 6
        const cp1y = p1[1] + (p2[1] - p0[1]) / 6
        const cp2x = p2[0] - (p3[0] - p1[0]) / 6
        const cp2y = p2[1] - (p3[1] - p1[1]) / 6
        d += ` C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0].toFixed(2)},${p2[1].toFixed(2)}`
      }
      return d
    }

    const verticalPaths = Array.from({ length: cols + 1 }, (_, i) => {
      const x = (i / cols) * width
      const points = Array.from({ length: 34 }, (_, j) => warpPoint(x, (j / 33) * height))
      return smoothPath(points)
    })

    const horizontalPaths = Array.from({ length: rows + 1 }, (_, i) => {
      const y = (i / rows) * height
      const points = Array.from({ length: 36 }, (_, j) => warpPoint((j / 35) * width, y))
      return smoothPath(points)
    })

    return {
      verticalPaths,
      horizontalPaths,
      highlightX: qcx - (qcx - qlx) * 1.2,
      highlightY: qcy - (qcy - qly) * 1.2,
      shadowX: qcx + (qcx - qlx) * 1.8,
      shadowY: qcy + (qcy - qly) * 1.8,
    }
  }, [enabled, nx, ny, lnx, lny, qcx, qcy, qlx, qly])

  return (
    <div className="mesh-wrap" aria-hidden="true">
      <svg className="mesh-svg" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <defs>
          <filter id="meshGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <g transform="translate(0 18) scale(1 0.92)">
          {verticalPaths.map((d, i) => (
            <path key={`vg-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1.9" filter="url(#meshGlow)" />
          ))}
          {horizontalPaths.map((d, i) => (
            <path key={`hg-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.035)" strokeWidth="1.9" filter="url(#meshGlow)" />
          ))}
          {verticalPaths.map((d, i) => (
            <path key={`v-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.84" />
          ))}
          {horizontalPaths.map((d, i) => (
            <path key={`h-${i}`} d={d} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.84" />
          ))}
        </g>
      </svg>
      {enabled && (
        <>
          <div className="mesh-glow" style={{ background: `radial-gradient(circle 260px at ${cx}px ${cy}px, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 24%, rgba(255,255,255,0) 60%)` }} />
          <div className="mesh-highlight" style={{ background: `radial-gradient(circle 210px at ${highlightX}px ${highlightY}px, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 20%, rgba(255,255,255,0) 58%)` }} />
          <div className="mesh-shadow" style={{ background: `radial-gradient(circle 280px at ${shadowX}px ${shadowY}px, rgba(0,0,0,0.22) 0%, rgba(0,0,0,0.12) 26%, rgba(0,0,0,0) 62%)` }} />
        </>
      )}
    </div>
  )
}

function ArchiveCard({ entry }: { entry: Entry }) {
  return (
    <div className="archive-card">
      <div className="micro">{entry.code}</div>
      <div className="archive-title">{entry.title}</div>
      <div className="archive-copy">{entry.summary}</div>
    </div>
  )
}

export default function App() {
  const [warpEnabled, setWarpEnabled] = useState(true)
  const [invert, setInvert] = useState(false)
  const { smoothX, smoothY, rawX, rawY, lagX, lagY } = useCursorField()
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  const heroX = useTransform(smoothX, (v) => ((v - window.innerWidth / 2) / window.innerWidth) * 8)
  const heroY = useTransform(smoothY, (v) => ((v - window.innerHeight / 2) / window.innerHeight) * -4)
  const heroRotateY = useTransform(smoothX, (v) => ((v - window.innerWidth / 2) / window.innerWidth) * 1.8)
  const heroRotateX = useTransform(smoothY, (v) => ((v - window.innerHeight / 2) / window.innerHeight) * 1.1)

  const handleContactSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const subject = encodeURIComponent(`contact enquiry from ${contactName || 'site visitor'}`)
    const body = encodeURIComponent(`name: ${contactName}\nemail: ${contactEmail}\n\nmessage:\n${contactMessage}`)
    window.location.href = `mailto:${site.contactEmail}?subject=${subject}&body=${body}`
  }

  return (
    <div className={`site-shell ${invert ? 'invert-mode' : ''}`}>
      <WarpedMesh cx={rawX} cy={rawY} lagX={lagX} lagY={lagY} enabled={warpEnabled} />

      <motion.div
        className="cursor-ring"
        style={{
          x: useTransform(smoothX, (v) => v - 180),
          y: useTransform(smoothY, (v) => v - 180),
        }}
      />
      <motion.div
        className="cursor-core"
        style={{
          x: useTransform(smoothX, (v) => v - 6),
          y: useTransform(smoothY, (v) => v - 6),
        }}
      />

      <div className="grain grain-vignette" />
      <div className="grain grain-noise" />
      <div className="grain grain-lines" />
      <div className="grain grain-specks" />

      <header className="topbar">
        <div className="brand">{site.brand}</div>
        <div className="nav-cluster">
          <nav className="index-nav">
            <a href="#hero">00 drown</a>
            <a href="#archive">01 archive</a>
            <a href="#listen">02 listen</a>
            <a href="#merch">03 merch</a>
            <a href="#contact">04 contact</a>
          </nav>
          <div className="top-actions">
            <a href={site.youtubeChannel} target="_blank" rel="noreferrer">
              youtube
            </a>
            <button type="button" onClick={() => setWarpEnabled((v) => !v)}>
              {warpEnabled ? 'warp off' : 'warp on'}
            </button>
            <button type="button" onClick={() => setInvert((v) => !v)}>
              {invert ? 'invert off' : 'invert on'}
            </button>
          </div>
        </div>
      </header>

      <main className="content">
        <section id="hero" className="hero section">
          <div className="fog-reveal" />
          <div className="hero-tags">
            <span>dream archive</span>
            <span>reactive signal</span>
            <span>late-night listening</span>
          </div>
          <div className="micro">enter softly</div>

          <motion.div className="hero-lockup" style={{ x: heroX, y: heroY, rotateY: heroRotateY, rotateX: heroRotateX }}>
            <div className="hero-word">drown</div>
            <div className="hero-word hero-word-second">in fog</div>
          </motion.div>

          <div className="hero-description">{site.description}</div>
          <div className="hero-gap" />
          <div className="hero-tagline">{site.tagline}</div>
        </section>

        <section id="archive" className="archive section">
          <div className="static-grid" />
          <div className="fog-reveal archive-fog" />
          <div className="archive-pos archive-pos-1"><ArchiveCard entry={archiveEntries[0]} /></div>
          <div className="archive-pos archive-pos-2"><ArchiveCard entry={archiveEntries[1]} /></div>
          <div className="archive-pos archive-pos-3"><ArchiveCard entry={archiveEntries[2]} /></div>
          <div className="archive-pos archive-pos-4"><ArchiveCard entry={archiveEntries[3]} /></div>
        </section>

        <section className="section cards-section">
          <div className="static-grid static-grid-soft" />
          <div className="cards-grid">
            <motion.article className="panel" id="listen" animate={{ y: [0, -8, 0], x: [0, 4, 0] }} transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}>
              <div className="micro">youtube stream</div>
              <h2>listen inside the fog.</h2>
              <p>stream selected drown in fog works directly from youtube and move into the full archive from here.</p>
              <div className="player-wrap">
                <iframe
                  className="player"
                  src={site.featuredEmbed}
                  title="drown in fog youtube player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <a className="ghost-button" href={site.youtubeChannel} target="_blank" rel="noreferrer">
                open youtube
              </a>
            </motion.article>

            <motion.article className="panel" id="merch" animate={{ y: [0, 7, 0], x: [0, -4, 0] }} transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}>
              <div className="micro">merch node</div>
              <h2>coming soon</h2>
              <p>the drown in fog store will open here with future garments, objects, and physical releases.</p>
              <div className="merch-grid">
                <div className="merch-tile">
                  <div className="micro">drop 001</div>
                  <div>fog garment</div>
                </div>
                <div className="merch-tile">
                  <div className="micro">drop 002</div>
                  <div>archive object</div>
                </div>
              </div>
              <span className="ghost-button ghost-button-muted">coming soon</span>
            </motion.article>
          </div>
        </section>

        <section id="contact" className="section contact-section">
          <div className="static-grid static-grid-faint" />
          <div className="contact-grid">
            <div className="contact-copy">
              <div className="micro">contact</div>
              <h2>stay connected.</h2>
              <p>
                for collaborations, releases, commissions, or questions, leave your details and a message below and
                drown in fog will get back to you.
              </p>
              <div className="contact-email">{site.contactEmail}</div>
            </div>

            <form onSubmit={handleContactSubmit} className="contact-form">
              <div className="form-row">
                <input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="your name" required />
                <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="your email" required />
              </div>
              <textarea value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} placeholder="your message" required />
              <button className="solid-button" type="submit">send message</button>
            </form>
          </div>
        </section>
      </main>
    </div>
  )
}

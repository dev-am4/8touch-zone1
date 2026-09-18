import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom/client'
import './styles.css'

const IDLE_MEDIA = './media/idle.mp4'
const SENSOR_EVENT = 'zone1:touch'
const RETURN_DELAY_MS = 900
const FALLBACK_DURATION_MS = 11000
const TOUCH_COOLDOWN_MS = 450

const ORGANS = [
  { id:'brain', order:'01', name:'สมอง', en:'BRAIN', zone:'โซน 3 · ฐานใจสุข กายสุข', short:'ความคิด · ความจำ · อารมณ์', risk:'ความเครียดสะสมและการพักผ่อนไม่เพียงพอทำให้สมองทำงานหนักเกินไป', care:'พักผ่อนให้เพียงพอ และจัดการความเครียดอย่างเหมาะสม', media:'./media/brain.mp4', x:50, y:14, hue:196 },
  { id:'mouth', order:'02', name:'ช่องปาก + ฟัน', en:'MOUTH + TEETH', zone:'โซน 2 · My Body', short:'จุดเริ่มต้นของระบบย่อยอาหาร', risk:'การละเลยการดูแลช่องปากเพิ่มความเสี่ยงฟันผุและเหงือกอักเสบ', care:'ดูแลช่องปากและแปรงฟันอย่างสม่ำเสมอ', media:'./media/mouth.mp4', x:50, y:24, hue:177 },
  { id:'lungs', order:'03', name:'ปอด', en:'LUNGS', zone:'โซน 4 · สารพิษสะกิดโรค', short:'ทุกลมหายใจคือการแลกเปลี่ยนออกซิเจน', risk:'PM2.5 และควันบุหรี่สะสมทำลายถุงลมทีละน้อย', care:'หลีกเลี่ยงฝุ่นควันและงดสูบบุหรี่', media:'./media/lungs.mp4', x:43, y:38, hue:188 },
  { id:'heart', order:'04', name:'หัวใจ', en:'HEART', zone:'โซน 5 · Fitness for Health', short:'สูบฉีดเลือดไปหล่อเลี้ยงทั่วร่างกาย', risk:'การไม่ออกกำลังกายและการกินไขมันสูงเพิ่มความเสี่ยงหลอดเลือดตีบตัน', care:'ขยับร่างกายและออกกำลังกายอย่างสม่ำเสมอ', media:'./media/heart.mp4', x:56, y:39, hue:350 },
  { id:'liver', order:'05', name:'ตับ', en:'LIVER', zone:'โซน 4 · สารพิษสะกิดโรค', short:'จัดการสารต่าง ๆ และช่วยกระบวนการย่อยอาหาร', risk:'การดื่มแอลกอฮอล์เป็นประจำทำลายเซลล์ตับสะสม', care:'ลดการดื่มแอลกอฮอล์เพื่อช่วยลดภาระของตับ', media:'./media/liver.mp4', x:57, y:49, hue:42 },
  { id:'kidney', order:'06', name:'ไต', en:'KIDNEYS', zone:'โซน 3 · Food and Fit', short:'กรองของเสียและรักษาสมดุลน้ำ', risk:'การกินเค็มจัดเป็นประจำเพิ่มภาระให้ไตทำงานหนักขึ้น', care:'ลดโซเดียมและดื่มน้ำให้เพียงพอ', media:'./media/kidney.mp4', x:43, y:53, hue:201 },
  { id:'digestive', order:'07', name:'กระเพาะ + ลำไส้', en:'DIGESTIVE', zone:'โซน 3 · Food and Fit', short:'ย่อยและดูดซึมสารอาหาร', risk:'หวาน มัน เค็มจัด และกากใยน้อย ทำให้ระบบย่อยอาหารเสียสมดุล', care:'เพิ่มผัก ผลไม้ ดื่มน้ำ และเคี้ยวอาหารช้า ๆ', media:'./media/digestive.mp4', x:50, y:60, hue:318 },
  { id:'muscle', order:'08', name:'กล้ามเนื้อ + กระดูก', en:'MUSCLE + BONE', zone:'โซน 5 · Fitness for Health', short:'ช่วยให้เราเคลื่อนไหวและพยุงร่างกาย', risk:'การนั่งนิ่งเป็นเวลานานทำให้กล้ามเนื้ออ่อนแรงและกระดูกเปราะบาง', care:'ขยับร่างกายและมีกิจกรรมทางกายเป็นประจำ', media:'./media/muscle.mp4', x:65, y:70, hue:36 },
]

function getOrgan(id) {
  return ORGANS.find(function (item) { return item.id === id })
}

function BodyMap({ onSelect, activeId }) {
  return (
    <div className="body-map touch-coordinate-space" aria-label="แผนที่ร่างกาย 8 จุดสัมผัส">
      <svg className="body-svg" viewBox="0 0 100 100" aria-hidden="true">
        <defs>
          <filter id="bodyGlow">
            <feGaussianBlur stdDeviation="1.1" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>
        <g className="human-outline" filter="url(#bodyGlow)">
          <circle cx="50" cy="11" r="6.6" />
          <path d="M43.7 21 C45.8 18.6 54.2 18.6 56.3 21 L61.5 43.5 C62.3 47 59.8 52 58 56.5 L56.5 64 L43.5 64 L42 56.5 C40.2 52 37.7 47 38.5 43.5 Z" />
          <path d="M41 25 C34 31 31 40 29 51 C28 56 31 57 33 52 L39 37" />
          <path d="M59 25 C66 31 69 40 71 51 C72 56 69 57 67 52 L61 37" />
          <path d="M45 62 C43 73 40 84 39 96 C39 99 43 99 44 96 L50 72" />
          <path d="M55 62 C57 73 60 84 61 96 C61 99 57 99 56 96 L50 72" />
        </g>
        <g className="body-lines">
          <path d="M50 19 L50 91" />
          <path d="M41 36 Q50 42 59 36" />
          <path d="M40 49 Q50 56 60 49" />
          <path d="M42 60 Q50 64 58 60" />
        </g>
      </svg>

      <div className="scan-line" />

      {ORGANS.map(function (organ, index) {
        return (
          <button
            type="button"
            key={organ.id}
            className={'hotspot hotspot-' + index + (activeId === organ.id ? ' is-active' : '')}
            style={{ '--x': organ.x + '%', '--y': organ.y + '%', '--hue': organ.hue }}
            onPointerDown={function (event) {
              event.preventDefault()
              onSelect(organ.id)
            }}
            aria-label={'แตะเพื่อดู ' + organ.name}
          >
            <span className="hotspot-ring" />
            <span className="hotspot-core" />
            <span className="hotspot-label">
              <strong>{organ.name}</strong>
              <small>{organ.en}</small>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function TouchOverlay({ onSelect }) {
  return (
    <div className="body-map touch-coordinate-space clip-touch-space" aria-label="พื้นที่สัมผัสอวัยวะ">
      {ORGANS.map(function (organ) {
        return (
          <button
            type="button"
            key={organ.id}
            className="sensor-hotspot"
            style={{ '--x': organ.x + '%', '--y': organ.y + '%', '--hue': organ.hue }}
            onPointerDown={function (event) {
              event.preventDefault()
              onSelect(organ.id)
            }}
            aria-label={'เปลี่ยนไปดู ' + organ.name}
          />
        )
      })}
    </div>
  )
}

function IdleStage({ onSelect, idleAvailable, onIdleStatus }) {
  return (
    <section className="stage idle-stage">
      <video
        className={'background-video' + (idleAvailable ? ' is-visible' : '')}
        src={IDLE_MEDIA}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        onCanPlay={function () { onIdleStatus(true) }}
        onError={function () { onIdleStatus(false) }}
      />

      <div className="ambient-grid" />
      <div className="ambient-orb ambient-orb-a" />
      <div className="ambient-orb ambient-orb-b" />

      <header className="idle-copy">
        <p className="eyebrow">SCIENCE FOR HEALTH · ZONE 1</p>
        <h1>สำรวจร่างกายของคุณ</h1>
        <p>สุขภาพดีเกิดขึ้นเมื่อทุกระบบทำงานร่วมกัน</p>
      </header>

      <BodyMap onSelect={onSelect} />

      <div className="touch-instruction">
        <span className="touch-icon" />
        <div><strong>แตะอวัยวะเพื่อสำรวจ</strong><small>เลือกได้ 8 จุด</small></div>
      </div>
    </section>
  )
}

function ClipStage({ organ, onEnded, onSwitch, onMediaStatus }) {
  const [playable, setPlayable] = useState(true)
  const timerRef = useRef(null)
  const videoRef = useRef(null)

  useEffect(function () {
    setPlayable(true)
    window.clearTimeout(timerRef.current)
    const timeout = window.setTimeout(function () {
      if (videoRef.current && videoRef.current.readyState < 2) {
        setPlayable(false)
        onMediaStatus(organ.id, 'missing')
      }
    }, 1800)
    return function () {
      window.clearTimeout(timeout)
      window.clearTimeout(timerRef.current)
    }
  }, [organ.id, onMediaStatus])

  useEffect(function () {
    if (!playable) {
      timerRef.current = window.setTimeout(onEnded, FALLBACK_DURATION_MS)
      return function () { window.clearTimeout(timerRef.current) }
    }
  }, [playable, onEnded])

  return (
    <section className="stage clip-stage" style={{ '--active-hue': organ.hue }}>
      <div className="clip-aura" />

      {playable ? (
        <video
          ref={videoRef}
          key={organ.id}
          className="organ-video"
          src={organ.media}
          autoPlay
          playsInline
          preload="auto"
          onPlaying={function () { onMediaStatus(organ.id, 'ready') }}
          onEnded={onEnded}
          onError={function () {
            setPlayable(false)
            onMediaStatus(organ.id, 'missing')
          }}
        />
      ) : (
        <div className="fallback-story">
          <div className="fallback-orbit"><span /><span /><span /></div>
          <p className="eyebrow">{organ.en}</p>
          <h2>{organ.name}</h2>
          <p className="fallback-lead">{organ.short}</p>
          <div className="fallback-flow">
            <div><small>ความเสี่ยง</small><p>{organ.risk}</p></div>
            <div><small>ดูแล</small><p>{organ.care}</p></div>
          </div>
          <p className="zone-link">{organ.zone}</p>
        </div>
      )}

      <div className="clip-header">
        <div><span>{organ.order}</span><p>{organ.en}</p></div>
        <strong>{organ.name}</strong>
      </div>

      <TouchOverlay onSelect={onSwitch} />

      <div className="clip-footer">
        <span className="progress-pulse" />
        <div>
          <small>เชื่อมโยงไป</small>
          <strong>{organ.zone}</strong>
          <span className="switch-hint">แตะอวัยวะอื่นเพื่อเปลี่ยนเรื่องได้ทันที</span>
        </div>
      </div>
    </section>
  )
}

function OperatorPanel({ open, onClose, state, mediaStatus, onTest, onIdle, pointer, debugTouch, onToggleDebug }) {
  if (!open) return null
  const readyCount = Object.values(mediaStatus).filter(function (status) { return status === 'ready' }).length

  return (
    <aside className="operator-panel">
      <div className="operator-head">
        <div><small>OPERATOR · F9</small><strong>Zone 1 Diagnostics</strong></div>
        <button type="button" onClick={onClose}>ปิด</button>
      </div>

      <div className="operator-stats">
        <div><small>STATE</small><strong>{state}</strong></div>
        <div><small>MEDIA</small><strong>{readyCount}/9</strong></div>
        <div><small>POINTER</small><strong>{pointer.x}, {pointer.y}</strong></div>
      </div>

      <div className="operator-actions">
        <button type="button" className="operator-idle" onClick={onIdle}>กลับ Idle</button>
        <button type="button" className={debugTouch ? 'operator-debug is-active' : 'operator-debug'} onClick={onToggleDebug}>
          {debugTouch ? 'ซ่อน Touch Area' : 'แสดง Touch Area'}
        </button>
      </div>

      <div className="operator-list">
        {ORGANS.map(function (organ) {
          const status = mediaStatus[organ.id] || 'unknown'
          return (
            <button type="button" key={organ.id} onClick={function () { onTest(organ.id) }}>
              <span className={'status-dot status-' + status} />
              <span><strong>{organ.name}</strong><small>{organ.media}</small></span>
            </button>
          )
        })}
      </div>

      <p className="operator-help">
        Sensor แบบ Mouse/Touch ใช้ได้ทันที · F8 แสดงพื้นที่แตะสำหรับ Calibration · External bridge ส่ง event
        <code>{SENSOR_EVENT}</code> พร้อมค่า x/y แบบ normalized 0–1 ของทั้งจอ หรือพิกัด pixel
      </p>
    </aside>
  )
}

function App() {
  const [mode, setMode] = useState('idle')
  const [activeId, setActiveId] = useState(null)
  const [idleAvailable, setIdleAvailable] = useState(false)
  const [operatorOpen, setOperatorOpen] = useState(false)
  const [mediaStatus, setMediaStatus] = useState({ idle:'unknown' })
  const [pointer, setPointer] = useState({ x:0, y:0 })
  const [debugTouch, setDebugTouch] = useState(false)
  const returnTimer = useRef(null)
  const lastTouchRef = useRef({ id:null, at:0 })

  const activeOrgan = useMemo(function () { return getOrgan(activeId) }, [activeId])

  const setMedia = useCallback(function (id, status) {
    setMediaStatus(function (current) {
      return Object.assign({}, current, { [id]: status })
    })
  }, [])

  const goIdle = useCallback(function () {
    window.clearTimeout(returnTimer.current)
    setMode('idle')
    setActiveId(null)
  }, [])

  const playOrgan = useCallback(function (id) {
    if (!getOrgan(id)) return
    const now = Date.now()
    const last = lastTouchRef.current
    if (last.id === id && now - last.at < TOUCH_COOLDOWN_MS) return
    lastTouchRef.current = { id:id, at:now }

    window.clearTimeout(returnTimer.current)
    setActiveId(id)
    setMode('clip')
  }, [])

  const endClip = useCallback(function () {
    window.clearTimeout(returnTimer.current)
    returnTimer.current = window.setTimeout(goIdle, RETURN_DELAY_MS)
  }, [goIdle])

  const hitTestSensor = useCallback(function (x, y) {
    const surface = document.querySelector('.touch-coordinate-space')
    if (!surface) return

    const rect = surface.getBoundingClientRect()
    const screenX = x >= 0 && x <= 1 ? x * window.innerWidth : x
    const screenY = y >= 0 && y <= 1 ? y * window.innerHeight : y
    const localX = ((screenX - rect.left) / rect.width) * 100
    const localY = ((screenY - rect.top) / rect.height) * 100

    if (localX < -5 || localX > 105 || localY < -5 || localY > 105) return

    let winner = null
    let nearest = Infinity
    ORGANS.forEach(function (organ) {
      const dx = localX - organ.x
      const dy = localY - organ.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      if (distance < nearest) {
        nearest = distance
        winner = organ
      }
    })

    if (winner && nearest <= 11) playOrgan(winner.id)
  }, [playOrgan])

  useEffect(function () {
    const media = [IDLE_MEDIA].concat(ORGANS.map(function (organ) { return organ.media }))
    const preloaders = media.map(function (src, index) {
      const video = document.createElement('video')
      const key = index === 0 ? 'idle' : ORGANS[index - 1].id
      const ready = function () { setMedia(key, 'ready') }
      const missing = function () { setMedia(key, 'missing') }
      video.preload = 'auto'
      video.muted = true
      video.src = src
      video.addEventListener('canplay', ready, { once:true })
      video.addEventListener('error', missing, { once:true })
      video.load()
      return { video:video, ready:ready, missing:missing }
    })

    return function () {
      preloaders.forEach(function (item) {
        item.video.removeEventListener('canplay', item.ready)
        item.video.removeEventListener('error', item.missing)
        item.video.removeAttribute('src')
        item.video.load()
      })
    }
  }, [setMedia])

  useEffect(function () {
    const onKey = function (event) {
      if (event.key === 'F9') {
        event.preventDefault()
        setOperatorOpen(function (value) { return !value })
      }
      if (event.key === 'F8') {
        event.preventDefault()
        setDebugTouch(function (value) { return !value })
      }
      if (event.key === 'Escape' && operatorOpen) {
        event.preventDefault()
        setOperatorOpen(false)
      }
      if ((event.key === 'Home' || event.key.toLowerCase() === 'i') && event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        goIdle()
      }
    }
    window.addEventListener('keydown', onKey)
    return function () { window.removeEventListener('keydown', onKey) }
  }, [goIdle, operatorOpen])

  useEffect(function () {
    const onSensor = function (event) {
      const x = Number(event.detail && event.detail.x)
      const y = Number(event.detail && event.detail.y)
      if (Number.isFinite(x) && Number.isFinite(y)) hitTestSensor(x, y)
    }
    const onMessage = function (event) {
      if (!event.data || event.data.type !== SENSOR_EVENT) return
      const x = Number(event.data.x)
      const y = Number(event.data.y)
      if (Number.isFinite(x) && Number.isFinite(y)) hitTestSensor(x, y)
    }
    window.addEventListener(SENSOR_EVENT, onSensor)
    window.addEventListener('message', onMessage)
    return function () {
      window.removeEventListener(SENSOR_EVENT, onSensor)
      window.removeEventListener('message', onMessage)
    }
  }, [hitTestSensor])

  useEffect(function () {
    return function () { window.clearTimeout(returnTimer.current) }
  }, [])

  return (
    <main
      className={'app-shell' + (debugTouch ? ' show-touch-debug' : '')}
      onPointerMove={function (event) {
        if (!operatorOpen) return
        setPointer({ x:Math.round(event.clientX), y:Math.round(event.clientY) })
      }}
    >
      {mode === 'idle' || !activeOrgan ? (
        <IdleStage
          onSelect={playOrgan}
          idleAvailable={idleAvailable}
          onIdleStatus={function (value) {
            setIdleAvailable(value)
            setMedia('idle', value ? 'ready' : 'missing')
          }}
        />
      ) : (
        <ClipStage organ={activeOrgan} onEnded={endClip} onSwitch={playOrgan} onMediaStatus={setMedia} />
      )}

      <button type="button" className="operator-corner" aria-label="เปิด operator" onDoubleClick={function () { setOperatorOpen(true) }} />

      <OperatorPanel
        open={operatorOpen}
        onClose={function () { setOperatorOpen(false) }}
        state={mode === 'clip' && activeOrgan ? 'clip:' + activeOrgan.id : 'idle'}
        mediaStatus={mediaStatus}
        onTest={playOrgan}
        onIdle={goIdle}
        pointer={pointer}
        debugTouch={debugTouch}
        onToggleDebug={function () { setDebugTouch(function (value) { return !value }) }}
      />
    </main>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)

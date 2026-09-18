import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BodyMap from './components/BodyMap'
import CalibrationOverlay from './components/CalibrationOverlay'
import OperatorPanel from './components/OperatorPanel'
import PrototypeScene from './components/PrototypeScene'
import { EXHIBIT_CONFIG } from './config/exhibit'
import { getOrgan } from './data/organs'
import {
  loadCalibration,
  resetCalibration,
  saveCalibration,
} from './core/calibration'
import { createPrototypeMediaProvider } from './core/mediaProvider'
import { hitTestBodyMap } from './core/touchEngine'

const mediaProvider = createPrototypeMediaProvider()

export default function App() {
  const [state, setState] = useState('idle')
  const [activeId, setActiveId] = useState(null)
  const [operatorOpen, setOperatorOpen] = useState(false)
  const [debugTouch, setDebugTouch] = useState(false)
  const [calibrationMode, setCalibrationMode] = useState(false)
  const [calibration, setCalibration] = useState(() => loadCalibration())
  const [pointer, setPointer] = useState({ x: 0, y: 0 })

  const storyTimer = useRef(null)
  const lastTouch = useRef({ id: null, at: 0 })
  const activeOrgan = useMemo(() => getOrgan(activeId), [activeId])

  const clearStoryTimer = useCallback(() => {
    window.clearTimeout(storyTimer.current)
  }, [])

  const goIdle = useCallback(() => {
    clearStoryTimer()
    setState('idle')
    setActiveId(null)
  }, [clearStoryTimer])

  const applyCalibration = useCallback((nextCalibration) => {
    const saved = saveCalibration(nextCalibration)
    setCalibration(saved)
  }, [])

  const resetCalibrationLayout = useCallback(() => {
    const reset = resetCalibration()
    setCalibration(reset)
  }, [])

  const enterCalibration = useCallback(() => {
    goIdle()
    setOperatorOpen(false)
    setDebugTouch(true)
    setCalibrationMode(true)
  }, [goIdle])

  const exitCalibration = useCallback(() => {
    setCalibrationMode(false)
    setDebugTouch(false)
  }, [])

  const playOrgan = useCallback((id) => {
    if (calibrationMode) return

    const organ = getOrgan(id)
    if (!organ) return

    const now = Date.now()
    if (lastTouch.current.id === id && now - lastTouch.current.at < EXHIBIT_CONFIG.touchCooldownMs) return
    lastTouch.current = { id, at: now }

    clearStoryTimer()
    setActiveId(id)
    setState('story')

    storyTimer.current = window.setTimeout(() => {
      setState('idle')
      setActiveId(null)
    }, EXHIBIT_CONFIG.storyDurationMs)
  }, [calibrationMode, clearStoryTimer])

  const handleSensorPoint = useCallback((x, y) => {
    if (calibrationMode) return

    const surface = document.querySelector('.touch-coordinate-space')
    const organ = hitTestBodyMap({
      x,
      y,
      surface,
      calibration,
      accessRadius: EXHIBIT_CONFIG.touchLayout.accessTouchRadius,
      anatomicalRadius: EXHIBIT_CONFIG.touchLayout.anatomicalTouchRadius,
    })

    if (organ) playOrgan(organ.id)
  }, [calibration, calibrationMode, playOrgan])

  useEffect(() => {
    const eventName = EXHIBIT_CONFIG.sensorEventName

    const onSensor = (event) => {
      const x = Number(event.detail?.x)
      const y = Number(event.detail?.y)
      if (Number.isFinite(x) && Number.isFinite(y)) handleSensorPoint(x, y)
    }

    const onMessage = (event) => {
      if (event.data?.type !== eventName) return
      const x = Number(event.data?.x)
      const y = Number(event.data?.y)
      if (Number.isFinite(x) && Number.isFinite(y)) handleSensorPoint(x, y)
    }

    window.addEventListener(eventName, onSensor)
    window.addEventListener('message', onMessage)

    return () => {
      window.removeEventListener(eventName, onSensor)
      window.removeEventListener('message', onMessage)
    }
  }, [handleSensorPoint])

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'F7') {
        event.preventDefault()
        if (calibrationMode) exitCalibration()
        else enterCalibration()
      }

      if (event.key === 'F8' && !calibrationMode) {
        event.preventDefault()
        setDebugTouch((value) => !value)
      }

      if (event.key === 'F9' && !calibrationMode) {
        event.preventDefault()
        setOperatorOpen((value) => !value)
      }

      if (event.key === 'Escape') {
        if (calibrationMode) {
          event.preventDefault()
          exitCalibration()
        } else if (operatorOpen) {
          event.preventDefault()
          setOperatorOpen(false)
        }
      }

      if ((event.key === 'Home' || event.key.toLowerCase() === 'i') && event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        goIdle()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [calibrationMode, enterCalibration, exitCalibration, goIdle, operatorOpen])

  useEffect(() => () => clearStoryTimer(), [clearStoryTimer])

  return (
    <main
      className={
        'app-shell' +
        (debugTouch ? ' show-touch-debug' : '') +
        (calibrationMode ? ' calibration-active' : '')
      }
      onPointerMove={(event) => {
        if (!operatorOpen) return
        setPointer({ x: Math.round(event.clientX), y: Math.round(event.clientY) })
      }}
    >
      {state === 'idle' || !activeOrgan ? (
        <section className="stage idle-stage">
          <div className="ambient-grid" />
          <div className="ambient-orb ambient-orb-a" />
          <div className="ambient-orb ambient-orb-b" />

          <header className="idle-copy">
            <p className="eyebrow">SCIENCE FOR HEALTH · ZONE 1</p>
            <h1>{EXHIBIT_CONFIG.title}</h1>
            <p>{EXHIBIT_CONFIG.subtitle}</p>
          </header>

          <BodyMap
            onSelect={playOrgan}
            calibration={calibration}
            debug={debugTouch}
            disabled={calibrationMode}
          />

          <div className="touch-instruction">
            <span className="touch-icon" />
            <div>
              <strong>{EXHIBIT_CONFIG.idleHint}</strong>
              <small>8 จุดสัมผัสในโซนเอื้อมถึงง่าย · เด็ก ผู้ใหญ่ และผู้ใช้รถเข็น</small>
            </div>
          </div>

          <div className="prototype-badge">
            STRUCTURE PREVIEW · NO VIDEO LOADING
          </div>

          {calibrationMode && (
            <CalibrationOverlay
              calibration={calibration}
              onChange={applyCalibration}
              onReset={resetCalibrationLayout}
              onClose={exitCalibration}
            />
          )}
        </section>
      ) : (
        <section className="stage story-stage">
          <PrototypeScene organ={activeOrgan} />
          <BodyMap
            onSelect={playOrgan}
            calibration={calibration}
            debug={debugTouch}
            invisible
          />

          <div className="story-switch-hint">
            <span />
            แตะอวัยวะอื่นเพื่อเปลี่ยนเรื่องได้ทันที
          </div>
        </section>
      )}

      <button
        type="button"
        className="operator-corner"
        aria-label="เปิด Operator Panel"
        onDoubleClick={() => {
          if (!calibrationMode) setOperatorOpen(true)
        }}
      />

      <OperatorPanel
        open={operatorOpen}
        state={state}
        activeId={activeId}
        pointer={pointer}
        debugTouch={debugTouch}
        calibration={calibration}
        onClose={() => setOperatorOpen(false)}
        onIdle={goIdle}
        onSelect={playOrgan}
        onToggleDebug={() => setDebugTouch((value) => !value)}
        onOpenCalibration={enterCalibration}
      />

      <div className="runtime-indicator" aria-hidden="true">
        {mediaProvider.mode}
      </div>
    </main>
  )
}

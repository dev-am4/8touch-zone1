import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BodyMap from './components/BodyMap'
import CalibrationOverlay from './components/CalibrationOverlay'
import OperatorPanel from './components/OperatorPanel'
import ProjectionSetupOverlay from './components/ProjectionSetupOverlay'
import PrototypeScene from './components/PrototypeScene'
import { EXHIBIT_CONFIG } from './config/exhibit'
import { getOrgan } from './data/organs'
import {
  loadCalibration,
  resetCalibration,
  saveCalibration,
} from './core/calibration'
import { createPrototypeMediaProvider } from './core/mediaProvider'
import {
  loadProjectionSetup,
  resetProjectionSetup,
  saveProjectionSetup,
} from './core/projectionSetup'
import {
  createSystemConfig,
  downloadSystemConfig,
  parseSystemConfig,
} from './core/systemConfig'
import { hitTestBodyMap, hitTestScreenTarget } from './core/touchEngine'

const mediaProvider = createPrototypeMediaProvider()

export default function App() {
  const [state, setState] = useState('idle')
  const [activeId, setActiveId] = useState(null)
  const [operatorOpen, setOperatorOpen] = useState(false)
  const [debugTouch, setDebugTouch] = useState(false)
  const [calibrationMode, setCalibrationMode] = useState(false)
  const [projectionMode, setProjectionMode] = useState(false)
  const [calibration, setCalibration] = useState(() => loadCalibration())
  const [projection, setProjection] = useState(() => loadProjectionSetup())
  const [pointer, setPointer] = useState({ x: 0, y: 0 })
  const [sensorStatus, setSensorStatus] = useState({
    status: 'waiting',
    lastPoint: { x: '—', y: '—' },
    lastSeen: null,
  })

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
    setCalibration(resetCalibration())
  }, [])

  const applyProjection = useCallback((nextProjection) => {
    const saved = saveProjectionSetup(nextProjection)
    setProjection(saved)
  }, [])

  const resetProjectionLayout = useCallback(() => {
    setProjection(resetProjectionSetup())
  }, [])

  const exportSystemConfig = useCallback(() => {
    downloadSystemConfig(createSystemConfig({ calibration, projection }))
  }, [calibration, projection])

  const importSystemConfig = useCallback((source) => {
    const imported = parseSystemConfig(source)
    const savedProjection = saveProjectionSetup(imported.projection)
    const savedCalibration = saveCalibration(imported.calibration)
    setProjection(savedProjection)
    setCalibration(savedCalibration)
    goIdle()
  }, [goIdle])

  const enterCalibration = useCallback(() => {
    goIdle()
    setProjectionMode(false)
    setOperatorOpen(false)
    setDebugTouch(true)
    setCalibrationMode(true)
  }, [goIdle])

  const exitCalibration = useCallback(() => {
    setCalibrationMode(false)
    setDebugTouch(false)
  }, [])

  const enterProjection = useCallback(() => {
    goIdle()
    setCalibrationMode(false)
    setOperatorOpen(false)
    setDebugTouch(false)
    setProjectionMode(true)
  }, [goIdle])

  const exitProjection = useCallback(() => {
    setProjectionMode(false)
  }, [])

  const playOrgan = useCallback((id) => {
    if (calibrationMode || projectionMode) return

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
  }, [calibrationMode, projectionMode, clearStoryTimer])

  const handleSensorPoint = useCallback((x, y) => {
    if (calibrationMode || projectionMode) return

    if (
      state === 'story' &&
      hitTestScreenTarget({
        x,
        y,
        target: EXHIBIT_CONFIG.touchLayout.backTarget,
      })
    ) {
      goIdle()
      return
    }

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
  }, [calibration, calibrationMode, projectionMode, playOrgan, state, goIdle])

  useEffect(() => {
    const eventName = EXHIBIT_CONFIG.sensorEventName

    const recordSensor = (x, y) => {
      setSensorStatus({
        status: 'receiving',
        lastPoint: {
          x: Number.isInteger(x) ? String(x) : x.toFixed(3),
          y: Number.isInteger(y) ? String(y) : y.toFixed(3),
        },
        lastSeen: Date.now(),
      })
    }

    const onSensor = (event) => {
      const x = Number(event.detail?.x)
      const y = Number(event.detail?.y)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        recordSensor(x, y)
        handleSensorPoint(x, y)
      }
    }

    const onMessage = (event) => {
      if (event.data?.type !== eventName) return
      const x = Number(event.data?.x)
      const y = Number(event.data?.y)
      if (Number.isFinite(x) && Number.isFinite(y)) {
        recordSensor(x, y)
        handleSensorPoint(x, y)
      }
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
      if (event.key === 'F6') {
        event.preventDefault()
        if (projectionMode) exitProjection()
        else enterProjection()
      }

      if (event.key === 'F7') {
        event.preventDefault()
        if (calibrationMode) exitCalibration()
        else enterCalibration()
      }

      if (event.key === 'F8' && !calibrationMode && !projectionMode) {
        event.preventDefault()
        setDebugTouch((value) => !value)
      }

      if (event.key === 'F9' && !calibrationMode && !projectionMode) {
        event.preventDefault()
        setOperatorOpen((value) => !value)
      }

      if (event.key === 'Escape') {
        if (projectionMode) {
          event.preventDefault()
          exitProjection()
        } else if (calibrationMode) {
          event.preventDefault()
          exitCalibration()
        } else if (operatorOpen) {
          event.preventDefault()
          setOperatorOpen(false)
        } else if (state === 'story') {
          event.preventDefault()
          goIdle()
        }
      }

      if ((event.key === 'Home' || event.key.toLowerCase() === 'i') && event.ctrlKey && event.shiftKey) {
        event.preventDefault()
        goIdle()
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [
    calibrationMode,
    projectionMode,
    enterCalibration,
    exitCalibration,
    enterProjection,
    exitProjection,
    goIdle,
    operatorOpen,
    state,
  ])

  useEffect(() => () => clearStoryTimer(), [clearStoryTimer])

  const setupActive = calibrationMode || projectionMode

  return (
    <main
      className={
        'app-shell' +
        (debugTouch ? ' show-touch-debug' : '') +
        (calibrationMode ? ' calibration-active' : '') +
        (projectionMode ? ' projection-active' : '')
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
            projection={projection}
            debug={debugTouch}
            disabled={setupActive}
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

          {projectionMode && (
            <ProjectionSetupOverlay
              projection={projection}
              onChange={applyProjection}
              onReset={resetProjectionLayout}
              onClose={exitProjection}
            />
          )}

          {calibrationMode && (
            <CalibrationOverlay
              calibration={calibration}
              projection={projection}
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
            projection={projection}
            debug={debugTouch}
            invisible
          />

          <button
            type="button"
            className="story-back-button"
            style={{
              '--back-x': EXHIBIT_CONFIG.touchLayout.backTarget.x + '%',
              '--back-y': EXHIBIT_CONFIG.touchLayout.backTarget.y + '%',
              '--back-width': EXHIBIT_CONFIG.touchLayout.backTarget.width + '%',
              '--back-height': EXHIBIT_CONFIG.touchLayout.backTarget.height + '%',
            }}
            onPointerDown={(event) => {
              event.preventDefault()
              goIdle()
            }}
            aria-label="กลับหน้าหลัก"
          >
            <span className="story-back-icon">←</span>
            <span className="story-back-copy">
              <strong>กลับ</strong>
              <small>หน้าหลัก</small>
            </span>
          </button>

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
          if (!setupActive) setOperatorOpen(true)
        }}
      />

      <OperatorPanel
        open={operatorOpen}
        state={state}
        activeId={activeId}
        pointer={pointer}
        debugTouch={debugTouch}
        calibration={calibration}
        projection={projection}
        sensorStatus={sensorStatus}
        onClose={() => setOperatorOpen(false)}
        onIdle={goIdle}
        onSelect={playOrgan}
        onToggleDebug={() => setDebugTouch((value) => !value)}
        onOpenCalibration={enterCalibration}
        onOpenProjection={enterProjection}
        onExportSystem={exportSystemConfig}
        onImportSystem={importSystemConfig}
      />

      <div className="runtime-indicator" aria-hidden="true">
        {mediaProvider.mode}
      </div>
    </main>
  )
}

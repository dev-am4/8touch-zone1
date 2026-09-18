import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import BodyMap from './components/BodyMap'
import CalibrationOverlay from './components/CalibrationOverlay'
import OperatorPanel from './components/OperatorPanel'
import PlaybackStage from './components/PlaybackStage'
import ProjectionSetupOverlay from './components/ProjectionSetupOverlay'
import { EXHIBIT_CONFIG } from './config/exhibit'
import { getOrgan } from './data/organs'
import {
  loadCalibration,
  resetCalibration,
  saveCalibration,
} from './core/calibration'
import { createRuntimeMediaProvider } from './core/mediaProvider'
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

const mediaProvider = createRuntimeMediaProvider()
const hasRealMedia = mediaProvider.hasMedia()

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
  const [mediaStatus, setMediaStatus] = useState({
    mode: mediaProvider.mode,
    inventory: null,
    error: null,
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
    if (
      lastTouch.current.id === id &&
      now - lastTouch.current.at < EXHIBIT_CONFIG.touchCooldownMs
    ) {
      return
    }

    lastTouch.current = { id, at: now }

    if (
      EXHIBIT_CONFIG.playback.sameTouchCancels &&
      state === 'story' &&
      activeId === id
    ) {
      goIdle()
      return
    }

    clearStoryTimer()
    setActiveId(id)
    setState('story')

    if (!hasRealMedia) {
      storyTimer.current = window.setTimeout(() => {
        setState('idle')
        setActiveId(null)
      }, EXHIBIT_CONFIG.storyDurationMs)
    }
  }, [
    activeId,
    calibrationMode,
    clearStoryTimer,
    goIdle,
    projectionMode,
    state,
  ])

  const handleStoryEnded = useCallback((organId) => {
    if (
      EXHIBIT_CONFIG.playback.storyEndReturnsIdle &&
      state === 'story' &&
      activeId === organId
    ) {
      goIdle()
    }
  }, [activeId, goIdle, state])

  const handlePlaybackError = useCallback((error) => {
    setMediaStatus((current) => ({
      ...current,
      error: error?.message || 'Media playback error',
    }))

    if (error?.target?.kind === 'story') {
      goIdle()
    }
  }, [goIdle])

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
  }, [
    calibration,
    calibrationMode,
    goIdle,
    playOrgan,
    projectionMode,
    state,
  ])

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
    let disposed = false

    const readInventory = async () => {
      if (!window.zone1Kiosk?.getMediaStatus) return

      try {
        const inventory = await window.zone1Kiosk.getMediaStatus()
        if (!disposed) {
          setMediaStatus({
            mode: mediaProvider.mode,
            inventory,
            error: null,
          })
        }
      } catch (error) {
        if (!disposed) {
          setMediaStatus((current) => ({
            ...current,
            error: error?.message || 'Cannot read media inventory',
          }))
        }
      }
    }

    readInventory()
    return () => {
      disposed = true
    }
  }, [])

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

      if (
        (event.key === 'Home' || event.key.toLowerCase() === 'i') &&
        event.ctrlKey &&
        event.shiftKey
      ) {
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
  const storyActive = state === 'story' && Boolean(activeOrgan)
  const showVisitorLabels = hasRealMedia
    ? EXHIBIT_CONFIG.visitorUi.labelsInKiosk
    : EXHIBIT_CONFIG.visitorUi.labelsInWebPreview
  const showBackGraphic = hasRealMedia
    ? EXHIBIT_CONFIG.visitorUi.backGraphicInKiosk
    : EXHIBIT_CONFIG.visitorUi.backGraphicInWebPreview

  return (
    <main
      className={
        'app-shell' +
        (debugTouch ? ' show-touch-debug' : '') +
        (calibrationMode ? ' calibration-active' : '') +
        (projectionMode ? ' projection-active' : '') +
        (storyActive ? ' story-active' : ' idle-active')
      }
      onPointerMove={(event) => {
        if (!operatorOpen) return
        setPointer({
          x: Math.round(event.clientX),
          y: Math.round(event.clientY),
        })
      }}
    >
      <section className="stage experience-stage">
        {!hasRealMedia && (
          <>
            <div className="ambient-grid" />
            <div className="ambient-orb ambient-orb-a" />
            <div className="ambient-orb ambient-orb-b" />
          </>
        )}

        <PlaybackStage
          provider={mediaProvider}
          activeOrgan={storyActive ? activeOrgan : null}
          transitionMs={EXHIBIT_CONFIG.playback.transitionMs}
          homeFrameSeconds={EXHIBIT_CONFIG.playback.homeFrameSeconds}
          restartIdleAtHomeFrame={EXHIBIT_CONFIG.playback.restartIdleAtHomeFrame}
          onStoryEnded={handleStoryEnded}
          onPlaybackError={handlePlaybackError}
        />

        <div className={'idle-ui-layer' + (!storyActive ? ' is-visible' : '')}>
          <BodyMap
            onSelect={playOrgan}
            calibration={calibration}
            projection={projection}
            debug={debugTouch}
            showLabels={showVisitorLabels}
            disabled={setupActive}
          />
        </div>

        {storyActive && (
          <div className="story-ui-layer is-visible">
            <BodyMap
              onSelect={playOrgan}
              calibration={calibration}
              projection={projection}
              activeId={activeId}
              debug={debugTouch}
              showLabels={showVisitorLabels}
            />

            <button
              type="button"
              className={'story-back-button video-back-target' + (showBackGraphic ? ' is-visible-control' : ' is-hit-only')}
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
              {showBackGraphic && <span className="story-back-icon">←</span>}
            </button>
          </div>
        )}

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
        mediaStatus={mediaStatus}
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

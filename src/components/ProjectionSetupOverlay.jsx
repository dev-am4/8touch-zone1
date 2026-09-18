import { useRef } from 'react'
import {
  createProjectionExport,
  projectionBodyStyle,
  safeAreaStyle,
} from '../core/projectionSetup'

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

function viewportPoint(event) {
  return {
    x: (event.clientX / window.innerWidth) * 100,
    y: (event.clientY / window.innerHeight) * 100,
  }
}

export default function ProjectionSetupOverlay({ projection, onChange, onReset, onClose }) {
  const dragRef = useRef(null)

  const beginMove = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)

    dragRef.current = {
      type: 'move',
      start: viewportPoint(event),
      startX: projection.bodyX,
      startY: projection.bodyY,
    }
  }

  const beginScale = (event) => {
    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture?.(event.pointerId)

    dragRef.current = {
      type: 'scale',
      start: viewportPoint(event),
      startScale: projection.bodyScale,
    }
  }

  const handleMove = (event) => {
    const drag = dragRef.current
    if (!drag) return

    event.preventDefault()
    const now = viewportPoint(event)

    if (drag.type === 'move') {
      const dx = now.x - drag.start.x
      const dy = now.y - drag.start.y
      onChange({
        ...projection,
        bodyX: Math.max(25, Math.min(75, drag.startX + dx)),
        bodyY: Math.max(28, Math.min(72, drag.startY + dy)),
      })
      return
    }

    const delta = ((now.x - drag.start.x) + (now.y - drag.start.y)) / 2
    onChange({
      ...projection,
      bodyScale: Math.max(0.65, Math.min(1.35, drag.startScale + delta / 45)),
    })
  }

  const endDrag = (event) => {
    if (!dragRef.current) return
    event.preventDefault()
    dragRef.current = null
  }

  const nudge = (dx, dy) => {
    onChange({
      ...projection,
      bodyX: Math.max(25, Math.min(75, projection.bodyX + dx)),
      bodyY: Math.max(28, Math.min(72, projection.bodyY + dy)),
    })
  }

  const scaleBy = (delta) => {
    onChange({
      ...projection,
      bodyScale: Math.max(0.65, Math.min(1.35, projection.bodyScale + delta)),
    })
  }

  const updateSafe = (key, value) => {
    onChange({
      ...projection,
      safeArea: {
        ...projection.safeArea,
        [key]: Number(value),
      },
    })
  }

  return (
    <>
      <div className="projection-grid" aria-hidden="true">
        <div className="projection-grid-major" />
        <div className="projection-crosshair projection-crosshair-x" />
        <div className="projection-crosshair projection-crosshair-y" />
      </div>

      <div className="projection-safe-area" style={safeAreaStyle(projection)}>
        <span>SAFE AREA</span>
      </div>

      <div
        className="projection-body-frame"
        style={projectionBodyStyle(projection)}
        onPointerMove={handleMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <button
          type="button"
          className="projection-move-handle"
          onPointerDown={beginMove}
        >
          <span>ลากเพื่อย้ายร่างกาย</span>
        </button>

        <button
          type="button"
          className="projection-scale-handle"
          onPointerDown={beginScale}
          aria-label="ลากเพื่อปรับขนาดร่างกาย"
        />
      </div>

      <aside className="projection-panel">
        <div className="projection-panel-head">
          <div>
            <small>F6 · PROJECTION SETUP</small>
            <strong>Projection / Safe Area</strong>
          </div>
          <button type="button" onClick={onClose}>เสร็จสิ้น</button>
        </div>

        <p>
          จัดตำแหน่งและขนาด Body Map ให้ตรงกับพื้นที่ฉายก่อน แล้วค่อยเข้า F7 เพื่อคาลิเบรตจุดแตะ
        </p>

        <div className="projection-readout">
          <div><small>BODY X</small><strong>{projection.bodyX.toFixed(1)}%</strong></div>
          <div><small>BODY Y</small><strong>{projection.bodyY.toFixed(1)}%</strong></div>
          <div><small>SCALE</small><strong>{projection.bodyScale.toFixed(2)}×</strong></div>
        </div>

        <div className="projection-control-grid">
          <button type="button" onClick={() => nudge(0, -0.5)}>↑</button>
          <button type="button" onClick={() => nudge(-0.5, 0)}>←</button>
          <button type="button" onClick={() => nudge(0.5, 0)}>→</button>
          <button type="button" onClick={() => nudge(0, 0.5)}>↓</button>
          <button type="button" onClick={() => scaleBy(-0.02)}>− Scale</button>
          <button type="button" onClick={() => scaleBy(0.02)}>+ Scale</button>
        </div>

        <div className="projection-safe-controls">
          {[
            ['top', 'Top'],
            ['right', 'Right'],
            ['bottom', 'Bottom'],
            ['left', 'Left'],
          ].map(([key, label]) => (
            <label key={key}>
              <span>{label}</span>
              <input
                type="range"
                min="0"
                max="20"
                step="0.5"
                value={projection.safeArea[key]}
                onChange={(event) => updateSafe(key, event.target.value)}
              />
              <strong>{projection.safeArea[key].toFixed(1)}%</strong>
            </label>
          ))}
        </div>

        <div className="projection-panel-actions">
          <button
            type="button"
            onClick={() => downloadJson(createProjectionExport(projection), 'zone1-projection-setup.json')}
          >
            Export JSON
          </button>
          <button type="button" className="danger" onClick={onReset}>Reset</button>
        </div>

        <small className="projection-note">
          ลำดับหน้างาน: Warp/Blend → F6 Projection Setup → F7 Touch Calibration → ทดสอบทุกวัย → ล็อกค่า
        </small>
      </aside>
    </>
  )
}

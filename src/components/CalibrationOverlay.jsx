import { useRef, useState } from 'react'
import { ORGANS } from '../data/organs'
import { createCalibrationExport, resolveTouchPoint } from '../core/calibration'

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

function pointFromPointer(event, rect) {
  return {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
  }
}

export default function CalibrationOverlay({ calibration, onChange, onReset, onClose }) {
  const surfaceRef = useRef(null)
  const dragRef = useRef(null)
  const [selectedId, setSelectedId] = useState(null)

  const beginPointDrag = (event, organ) => {
    event.preventDefault()
    event.stopPropagation()
    const surface = surfaceRef.current
    if (!surface) return

    event.currentTarget.setPointerCapture?.(event.pointerId)
    const rect = surface.getBoundingClientRect()
    const start = pointFromPointer(event, rect)
    const current = calibration.points?.[organ.id] || { dx: 0, dy: 0 }

    dragRef.current = {
      type: 'point',
      id: organ.id,
      rect,
      start,
      startDx: current.dx || 0,
      startDy: current.dy || 0,
    }
    setSelectedId(organ.id)
  }

  const beginBandDrag = (event) => {
    event.preventDefault()
    event.stopPropagation()
    const surface = surfaceRef.current
    if (!surface) return

    event.currentTarget.setPointerCapture?.(event.pointerId)
    const rect = surface.getBoundingClientRect()
    const start = pointFromPointer(event, rect)

    dragRef.current = {
      type: 'band',
      rect,
      start,
      startBandY: calibration.bandOffsetY || 0,
    }
    setSelectedId(null)
  }

  const handleMove = (event) => {
    const drag = dragRef.current
    if (!drag) return

    event.preventDefault()
    const now = pointFromPointer(event, drag.rect)
    const deltaX = now.x - drag.start.x
    const deltaY = now.y - drag.start.y

    if (drag.type === 'band') {
      onChange({
        ...calibration,
        bandOffsetY: Math.max(-18, Math.min(6, drag.startBandY + deltaY)),
      })
      return
    }

    onChange({
      ...calibration,
      points: {
        ...(calibration.points || {}),
        [drag.id]: {
          dx: Math.max(-18, Math.min(18, drag.startDx + deltaX)),
          dy: Math.max(-12, Math.min(12, drag.startDy + deltaY)),
        },
      },
    })
  }

  const endDrag = (event) => {
    if (!dragRef.current) return
    event.preventDefault()
    dragRef.current = null
  }

  const nudgeSelected = (dx, dy) => {
    if (!selectedId) return
    const current = calibration.points?.[selectedId] || { dx: 0, dy: 0 }

    onChange({
      ...calibration,
      points: {
        ...(calibration.points || {}),
        [selectedId]: {
          dx: Math.max(-18, Math.min(18, (current.dx || 0) + dx)),
          dy: Math.max(-12, Math.min(12, (current.dy || 0) + dy)),
        },
      },
    })
  }

  return (
    <>
      <div
        ref={surfaceRef}
        className="body-map calibration-surface"
        onPointerMove={handleMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <div
          className="calibration-band-handle"
          style={{ '--band-y': (84.5 + (calibration.bandOffsetY || 0)) + '%' }}
          onPointerDown={beginBandDrag}
        >
          <span>ลากแถบทั้งหมดขึ้น / ลง</span>
        </div>

        {ORGANS.map((organ) => {
          const point = resolveTouchPoint(organ, calibration)
          const selected = selectedId === organ.id

          return (
            <button
              type="button"
              key={organ.id}
              className={'calibration-point' + (selected ? ' is-selected' : '')}
              style={{ '--x': point.x + '%', '--y': point.y + '%', '--hue': organ.hue }}
              onPointerDown={(event) => beginPointDrag(event, organ)}
            >
              <span>{organ.order}</span>
              <strong>{organ.name}</strong>
            </button>
          )
        })}
      </div>

      <aside className="calibration-panel">
        <div className="calibration-panel-head">
          <div>
            <small>F7 · SETUP MODE</small>
            <strong>Universal Reach Calibration</strong>
          </div>
          <button type="button" onClick={onClose}>เสร็จสิ้น</button>
        </div>

        <p>
          ลากแถบเส้นประเพื่อเลื่อน 8 จุดพร้อมกัน หรือเลือกจุดแล้วลากแยกทีละจุด
          ค่าจะบันทึกในเครื่องนี้อัตโนมัติ
        </p>

        <div className="calibration-readout">
          <div><small>BAND Y OFFSET</small><strong>{(calibration.bandOffsetY || 0).toFixed(1)}</strong></div>
          <div><small>SELECTED</small><strong>{selectedId || '—'}</strong></div>
        </div>

        <div className="calibration-nudge">
          <button type="button" disabled={!selectedId} onClick={() => nudgeSelected(0, -0.5)}>↑</button>
          <button type="button" disabled={!selectedId} onClick={() => nudgeSelected(-0.5, 0)}>←</button>
          <button type="button" disabled={!selectedId} onClick={() => nudgeSelected(0.5, 0)}>→</button>
          <button type="button" disabled={!selectedId} onClick={() => nudgeSelected(0, 0.5)}>↓</button>
        </div>

        <div className="calibration-panel-actions">
          <button
            type="button"
            onClick={() => downloadJson(createCalibrationExport(calibration), 'zone1-calibration.json')}
          >
            Export JSON
          </button>
          <button type="button" className="danger" onClick={onReset}>Reset</button>
        </div>

        <small className="calibration-note">
          Final QC: วัดจาก Finished Floor Level แล้วทดสอบจริงกับเด็ก ผู้ใหญ่ และผู้ใช้รถเข็นก่อนล็อกค่า
        </small>
      </aside>
    </>
  )
}

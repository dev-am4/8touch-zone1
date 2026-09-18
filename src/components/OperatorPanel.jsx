import { ORGANS } from '../data/organs'
import { resolveTouchPoint } from '../core/calibration'

export default function OperatorPanel({
  open,
  state,
  activeId,
  pointer,
  debugTouch,
  calibration,
  projection,
  onClose,
  onIdle,
  onSelect,
  onToggleDebug,
  onOpenCalibration,
  onOpenProjection,
}) {
  if (!open) return null

  return (
    <aside className="operator-panel">
      <div className="operator-head">
        <div><small>OPERATOR · F9</small><strong>Zone 1 Structure Preview</strong></div>
        <button type="button" onClick={onClose}>ปิด</button>
      </div>

      <div className="operator-stats">
        <div><small>STATE</small><strong>{state}</strong></div>
        <div><small>MODE</small><strong>PROTOTYPE</strong></div>
        <div><small>POINTER</small><strong>{pointer.x}, {pointer.y}</strong></div>
      </div>

      <div className="operator-actions operator-actions-4">
        <button type="button" onClick={onIdle}>กลับ Idle</button>
        <button type="button" className={debugTouch ? 'is-active' : ''} onClick={onToggleDebug}>
          {debugTouch ? 'ซ่อน Touch' : 'แสดง Touch'}
        </button>
        <button type="button" className="operator-projection" onClick={onOpenProjection}>
          F6 Projection
        </button>
        <button type="button" className="operator-calibration" onClick={onOpenCalibration}>
          F7 Touch
        </button>
      </div>

      <div className="operator-section-label">
        PROJECTION · X {projection.bodyX.toFixed(1)} · Y {projection.bodyY.toFixed(1)} · SCALE {projection.bodyScale.toFixed(2)}
      </div>

      <div className="operator-section-label">
        UNIVERSAL REACH · BAND OFFSET {Number(calibration?.bandOffsetY || 0).toFixed(1)}
      </div>

      <div className="operator-list">
        {ORGANS.map((organ) => {
          const point = resolveTouchPoint(organ, calibration)

          return (
            <button
              type="button"
              key={organ.id}
              className={activeId === organ.id ? 'is-current' : ''}
              onClick={() => onSelect(organ.id)}
            >
              <span>{organ.order}</span>
              <strong>{organ.name}</strong>
              <small>
                A {organ.anchorX},{organ.anchorY} · T {point.x.toFixed(1)},{point.y.toFixed(1)}
              </small>
            </button>
          )
        })}
      </div>

      <p className="operator-help">
        ลำดับหน้างาน: F6 จัดภาพ/ขนาด/พื้นที่ปลอดภัย → F7 จัดจุดแตะ → F8 ตรวจ Touch Area → ทดสอบจริงทุกวัย
      </p>
    </aside>
  )
}

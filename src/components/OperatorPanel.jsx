import { ORGANS } from '../data/organs'
import { resolveTouchPoint } from '../core/calibration'

export default function OperatorPanel({
  open,
  state,
  activeId,
  pointer,
  debugTouch,
  calibration,
  onClose,
  onIdle,
  onSelect,
  onToggleDebug,
  onOpenCalibration,
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

      <div className="operator-actions operator-actions-3">
        <button type="button" onClick={onIdle}>กลับ Idle</button>
        <button type="button" className={debugTouch ? 'is-active' : ''} onClick={onToggleDebug}>
          {debugTouch ? 'ซ่อน Touch Area' : 'แสดง Touch Area'}
        </button>
        <button type="button" className="operator-calibration" onClick={onOpenCalibration}>
          Calibration
        </button>
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
        F7 = Calibration Mode · A = ตำแหน่งอวัยวะบนภาพ · T = จุดแตะ Universal Reach หลังรวมค่าคาลิเบรต
        · Final QC ต้องวัดจากพื้นสำเร็จและทดสอบจริงกับเด็ก ผู้ใหญ่ และผู้ใช้รถเข็น
      </p>
    </aside>
  )
}

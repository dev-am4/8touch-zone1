import { ORGANS } from '../data/organs'

export default function OperatorPanel({ open, state, activeId, pointer, debugTouch, onClose, onIdle, onSelect, onToggleDebug }) {
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

      <div className="operator-actions">
        <button type="button" onClick={onIdle}>กลับ Idle</button>
        <button type="button" className={debugTouch ? 'is-active' : ''} onClick={onToggleDebug}>
          {debugTouch ? 'ซ่อน Touch Area' : 'แสดง Touch Area'}
        </button>
      </div>

      <div className="operator-list">
        {ORGANS.map((organ) => (
          <button type="button" key={organ.id} className={activeId === organ.id ? 'is-current' : ''} onClick={() => onSelect(organ.id)}>
            <span>{organ.order}</span>
            <strong>{organ.name}</strong>
            <small>{organ.x}, {organ.y}</small>
          </button>
        ))}
      </div>

      <p className="operator-help">
        ตอนนี้ไม่มีการโหลดวิดีโอจริง · ใช้หน้านี้สำหรับตรวจ Flow, Touch Map, สัดส่วนจอ และ Calibration เท่านั้น
      </p>
    </aside>
  )
}

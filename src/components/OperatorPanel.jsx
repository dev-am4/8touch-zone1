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
            <small>A {organ.anchorX},{organ.anchorY} · T {organ.touchX},{organ.touchY}</small>
          </button>
        ))}
      </div>

      <p className="operator-help">
        A = ตำแหน่งอวัยวะบนภาพ · T = จุดแตะ Universal Reach ด้านล่าง · ตอนติดตั้งจริงต้องวัดความสูงจากพื้นสำเร็จและคาลิเบรตให้เด็ก ผู้ใช้รถเข็น และผู้ใหญ่เอื้อมถึงได้ทุกจุด
      </p>
    </aside>
  )
}

import { useRef, useState } from 'react'
import { ORGANS } from '../data/organs'
import { resolveTouchPoint } from '../core/calibration'

function StatusCard({ label, value, tone = 'neutral', detail }) {
  return (
    <div className={'system-status-card tone-' + tone}>
      <div className="system-status-head">
        <small>{label}</small>
        <span />
      </div>
      <strong>{value}</strong>
      {detail && <p>{detail}</p>}
    </div>
  )
}

export default function OperatorPanel({
  open,
  state,
  activeId,
  pointer,
  debugTouch,
  calibration,
  projection,
  sensorStatus,
  onClose,
  onIdle,
  onSelect,
  onToggleDebug,
  onOpenCalibration,
  onOpenProjection,
  onExportSystem,
  onImportSystem,
}) {
  const fileInputRef = useRef(null)
  const [importMessage, setImportMessage] = useState('')
  if (!open) return null

  const isElectron = Boolean(window.zone1Kiosk?.isElectron)
  const sensorReceiving = sensorStatus?.status === 'receiving'

  const handleImport = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    try {
      const text = await file.text()
      onImportSystem(text)
      setImportMessage('นำเข้าค่าเรียบร้อย')
    } catch (error) {
      setImportMessage(error?.message || 'นำเข้าไฟล์ไม่สำเร็จ')
    }
  }

  return (
    <aside className="operator-panel operator-panel-v2">
      <div className="operator-head">
        <div>
          <small>OPERATOR · F9</small>
          <strong>Zone 1 Setup Console</strong>
        </div>
        <button type="button" onClick={onClose}>ปิด</button>
      </div>

      <div className="operator-stats">
        <div><small>STATE</small><strong>{state}</strong></div>
        <div><small>MODE</small><strong>PROTOTYPE</strong></div>
        <div><small>POINTER</small><strong>{pointer.x}, {pointer.y}</strong></div>
      </div>

      <div className="system-status-grid">
        <StatusCard
          label="PROJECTION"
          value="READY"
          tone="ready"
          detail={'X ' + projection.bodyX.toFixed(1) + ' · Y ' + projection.bodyY.toFixed(1) + ' · ' + projection.bodyScale.toFixed(2) + '×'}
        />
        <StatusCard
          label="TOUCH"
          value="READY"
          tone="ready"
          detail={'Band ' + Number(calibration?.bandOffsetY || 0).toFixed(1) + ' · 8 points'}
        />
        <StatusCard
          label="SENSOR"
          value={sensorReceiving ? 'EVENT RECEIVED' : 'WAITING'}
          tone={sensorReceiving ? 'ready' : 'waiting'}
          detail={
            sensorReceiving
              ? 'ล่าสุด ' + sensorStatus.lastPoint.x + ', ' + sensorStatus.lastPoint.y
              : 'รอ zone1:touch จาก sensor bridge'
          }
        />
        <StatusCard
          label="KIOSK"
          value={isElectron ? 'ELECTRON' : 'WEB PREVIEW'}
          tone={isElectron ? 'ready' : 'neutral'}
          detail={isElectron ? 'Kiosk shell detected' : 'Browser structure preview'}
        />
        <StatusCard
          label="MEDIA"
          value="KIOSK PHASE"
          tone="planned"
          detail="ยังไม่โหลดวิดีโอจริงใน Web Preview"
        />
      </div>

      <div className="operator-system-config">
        <div>
          <small>SYSTEM CONFIG</small>
          <strong>Projection + Touch ในไฟล์เดียว</strong>
          <p>Export จากเครื่องทดสอบ แล้ว Import ที่เครื่องหน้างานได้ทันที</p>
        </div>

        <div className="operator-config-actions">
          <button type="button" onClick={onExportSystem}>Export All Config</button>
          <button type="button" onClick={() => fileInputRef.current?.click()}>Import Config</button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={handleImport}
          />
        </div>

        {importMessage && <div className="operator-import-message">{importMessage}</div>}
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
        UNIVERSAL REACH · LIVE COORDINATES
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
        หน้างาน: F6 จัด Projection → F7 จัด Universal Reach → ต่อ Sensor และดู SENSOR เป็น EVENT RECEIVED → F8 ตรวจพื้นที่แตะ → ทดสอบทุกวัย
      </p>
    </aside>
  )
}

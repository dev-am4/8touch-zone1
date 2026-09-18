import { ORGANS } from '../data/organs'
import { resolveTouchPoint } from '../core/calibration'
import { projectionBodyStyle } from '../core/projectionSetup'

export default function BodyMap({
  onSelect,
  calibration,
  projection,
  activeId = null,
  debug = false,
  showLabels = false,
  disabled = false,
}) {
  return (
    <div
      className={
        'body-map touch-coordinate-space video-touch-layer' +
        (showLabels ? ' show-video-touch-labels' : '') +
        (debug ? ' is-debug' : '')
      }
      style={projectionBodyStyle(projection)}
    >
      {ORGANS.map((organ, index) => {
        const point = resolveTouchPoint(organ, calibration)
        const isActive = organ.id === activeId

        return (
          <button
            type="button"
            key={'access-' + organ.id}
            disabled={disabled}
            className={
              'video-touch-target hotspot-' + index +
              (isActive ? ' is-current-story' : '')
            }
            style={{
              '--x': point.x + '%',
              '--y': point.y + '%',
              '--hue': organ.hue,
            }}
            onPointerDown={(event) => {
              event.preventDefault()
              if (!disabled) onSelect(organ.id)
            }}
            aria-label={
              isActive
                ? 'แตะซ้ำเพื่อกลับหน้าหลักจาก ' + organ.name
                : 'แตะเพื่อดู ' + organ.name
            }
          >
            {showLabels && (
              <span className="video-touch-label">
                <strong>{organ.name}</strong>
              </span>
            )}
          </button>
        )
      })}

      {ORGANS.map((organ) => (
        <button
          type="button"
          key={'anatomy-' + organ.id}
          disabled={disabled}
          className="sensor-hotspot sensor-anatomy video-anatomy-target"
          style={{
            '--x': organ.anchorX + '%',
            '--y': organ.anchorY + '%',
            '--hue': organ.hue,
          }}
          onPointerDown={(event) => {
            event.preventDefault()
            if (!disabled) onSelect(organ.id)
          }}
          aria-label={'แตะอวัยวะ ' + organ.name}
        />
      ))}
    </div>
  )
}

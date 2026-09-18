import { ORGANS } from '../data/organs'
import { resolveTouchPoint } from '../core/calibration'
import { projectionBodyStyle } from '../core/projectionSetup'

export default function BodyMap({ onSelect, calibration, projection, debug = false, invisible = false, disabled = false }) {
  return (
    <div
      className={'body-map touch-coordinate-space' + (invisible ? ' body-map-invisible' : '') + (debug ? ' is-debug' : '')}
      style={projectionBodyStyle(projection)}
    >
      {!invisible && (
        <>
          <svg className="body-svg" viewBox="0 0 100 100" aria-hidden="true">
            <defs>
              <filter id="bodyGlow">
                <feGaussianBlur stdDeviation="1.1" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            <g className="human-outline" filter="url(#bodyGlow)">
              <circle cx="50" cy="11" r="6.6" />
              <path d="M43.7 21 C45.8 18.6 54.2 18.6 56.3 21 L61.5 43.5 C62.3 47 59.8 52 58 56.5 L56.5 64 L43.5 64 L42 56.5 C40.2 52 37.7 47 38.5 43.5 Z" />
              <path d="M41 25 C34 31 31 40 29 51 C28 56 31 57 33 52 L39 37" />
              <path d="M59 25 C66 31 69 40 71 51 C72 56 69 57 67 52 L61 37" />
              <path d="M45 62 C43 73 40 84 39 96 C39 99 43 99 44 96 L50 72" />
              <path d="M55 62 C57 73 60 84 61 96 C61 99 57 99 56 96 L50 72" />
            </g>

            <g className="body-lines">
              <path d="M50 19 L50 91" />
              <path d="M41 36 Q50 42 59 36" />
              <path d="M40 49 Q50 56 60 49" />
              <path d="M42 60 Q50 64 58 60" />
            </g>

            <g className="organ-connectors">
              {ORGANS.map((organ) => {
                const point = resolveTouchPoint(organ, calibration)
                return (
                  <line
                    key={organ.id}
                    x1={organ.anchorX}
                    y1={organ.anchorY}
                    x2={point.x}
                    y2={point.y}
                    style={{ '--hue': organ.hue }}
                  />
                )
              })}
            </g>

            <g className="organ-anchors">
              {ORGANS.map((organ) => (
                <circle
                  key={organ.id}
                  cx={organ.anchorX}
                  cy={organ.anchorY}
                  r="1.15"
                  style={{ '--hue': organ.hue }}
                />
              ))}
            </g>
          </svg>

          <div className="scan-line" />
          <div className="reach-band-label">UNIVERSAL REACH ZONE</div>
        </>
      )}

      {ORGANS.map((organ, index) => {
        const point = resolveTouchPoint(organ, calibration)
        return (
          <button
            type="button"
            key={'access-' + organ.id}
            disabled={disabled}
            className={(invisible ? 'sensor-hotspot sensor-access' : 'hotspot access-target') + ' hotspot-' + index}
            style={{ '--x': point.x + '%', '--y': point.y + '%', '--hue': organ.hue }}
            onPointerDown={(event) => {
              event.preventDefault()
              if (!disabled) onSelect(organ.id)
            }}
            aria-label={'แตะเพื่อดู ' + organ.name}
          >
            {!invisible && (
              <>
                <span className="hotspot-ring" />
                <span className="hotspot-core" />
                <span className="hotspot-label">
                  <strong>{organ.name}</strong>
                  <small>{organ.en}</small>
                </span>
              </>
            )}
          </button>
        )
      })}

      {ORGANS.map((organ) => (
        <button
          type="button"
          key={'anatomy-' + organ.id}
          disabled={disabled}
          className="sensor-hotspot sensor-anatomy"
          style={{ '--x': organ.anchorX + '%', '--y': organ.anchorY + '%', '--hue': organ.hue }}
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

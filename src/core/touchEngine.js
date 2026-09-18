import { ORGANS } from '../data/organs'
import { resolveTouchPoint } from './calibration'

export function normalizeSensorPoint(x, y) {
  const screenX = x >= 0 && x <= 1 ? x * window.innerWidth : x
  const screenY = y >= 0 && y <= 1 ? y * window.innerHeight : y
  return { screenX, screenY }
}

function toLocalPoint({ x, y, surface }) {
  if (!surface) return null

  const rect = surface.getBoundingClientRect()
  const { screenX, screenY } = normalizeSensorPoint(x, y)
  const localX = ((screenX - rect.left) / rect.width) * 100
  const localY = ((screenY - rect.top) / rect.height) * 100

  if (localX < -5 || localX > 105 || localY < -5 || localY > 105) return null
  return { localX, localY }
}

function nearestTouchPoint({ localX, localY, radius, calibration }) {
  let winner = null
  let nearest = Infinity

  ORGANS.forEach((organ) => {
    const point = resolveTouchPoint(organ, calibration)
    const dx = localX - point.x
    const dy = localY - point.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    if (distance < nearest) {
      nearest = distance
      winner = organ
    }
  })

  return winner && nearest <= radius ? winner : null
}

export function hitTestBodyMap({
  x,
  y,
  surface,
  calibration,
  accessRadius = 11,
}) {
  const point = toLocalPoint({ x, y, surface })
  if (!point) return null

  return nearestTouchPoint({
    ...point,
    radius: accessRadius,
    calibration,
  })
}

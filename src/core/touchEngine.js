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

function nearestAccessible({ localX, localY, radius, calibration }) {
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

function nearestAnatomical({ localX, localY, radius }) {
  let winner = null
  let nearest = Infinity

  ORGANS.forEach((organ) => {
    const dx = localX - organ.anchorX
    const dy = localY - organ.anchorY
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
  anatomicalRadius = 7,
}) {
  const point = toLocalPoint({ x, y, surface })
  if (!point) return null

  const accessible = nearestAccessible({
    ...point,
    radius: accessRadius,
    calibration,
  })

  if (accessible) return accessible

  return nearestAnatomical({
    ...point,
    radius: anatomicalRadius,
  })
}

import { ORGANS } from '../data/organs'

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

function nearestOrgan({ localX, localY, xKey, yKey, radius }) {
  let winner = null
  let nearest = Infinity

  ORGANS.forEach((organ) => {
    const dx = localX - organ[xKey]
    const dy = localY - organ[yKey]
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
  accessRadius = 11,
  anatomicalRadius = 7,
}) {
  const point = toLocalPoint({ x, y, surface })
  if (!point) return null

  // Accessible lower-zone targets have priority because they are the universal input path.
  const accessible = nearestOrgan({
    ...point,
    xKey: 'touchX',
    yKey: 'touchY',
    radius: accessRadius,
  })

  if (accessible) return accessible

  // Anatomical hit areas remain available as a secondary path for taller users.
  return nearestOrgan({
    ...point,
    xKey: 'anchorX',
    yKey: 'anchorY',
    radius: anatomicalRadius,
  })
}

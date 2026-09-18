import { ORGANS } from '../data/organs'

export function normalizeSensorPoint(x, y) {
  const screenX = x >= 0 && x <= 1 ? x * window.innerWidth : x
  const screenY = y >= 0 && y <= 1 ? y * window.innerHeight : y
  return { screenX, screenY }
}

export function hitTestBodyMap({ x, y, surface, radius }) {
  if (!surface) return null

  const rect = surface.getBoundingClientRect()
  const { screenX, screenY } = normalizeSensorPoint(x, y)
  const localX = ((screenX - rect.left) / rect.width) * 100
  const localY = ((screenY - rect.top) / rect.height) * 100

  if (localX < -5 || localX > 105 || localY < -5 || localY > 105) return null

  let winner = null
  let nearest = Infinity

  ORGANS.forEach((organ) => {
    const dx = localX - organ.x
    const dy = localY - organ.y
    const distance = Math.sqrt(dx * dx + dy * dy)
    if (distance < nearest) {
      nearest = distance
      winner = organ
    }
  })

  return winner && nearest <= radius ? winner : null
}

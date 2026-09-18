const STORAGE_KEY = 'zone1-calibration-v1'

export const DEFAULT_CALIBRATION = {
  version: 1,
  bandOffsetY: 0,
  points: {},
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function sanitizeCalibration(input) {
  const source = input && typeof input === 'object' ? input : {}
  const points = {}

  Object.entries(source.points || {}).forEach(([id, point]) => {
    const dx = Number(point?.dx)
    const dy = Number(point?.dy)
    points[id] = {
      dx: Number.isFinite(dx) ? clamp(dx, -18, 18) : 0,
      dy: Number.isFinite(dy) ? clamp(dy, -12, 12) : 0,
    }
  })

  const bandOffsetY = Number(source.bandOffsetY)

  return {
    version: 1,
    bandOffsetY: Number.isFinite(bandOffsetY) ? clamp(bandOffsetY, -18, 6) : 0,
    points,
  }
}

export function loadCalibration() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeCalibration(JSON.parse(raw)) : { ...DEFAULT_CALIBRATION }
  } catch {
    return { ...DEFAULT_CALIBRATION }
  }
}

export function saveCalibration(calibration) {
  const clean = sanitizeCalibration(calibration)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  return clean
}

export function resetCalibration() {
  window.localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_CALIBRATION, points: {} }
}

export function resolveTouchPoint(organ, calibration = DEFAULT_CALIBRATION) {
  const clean = sanitizeCalibration(calibration)
  const point = clean.points[organ.id] || { dx: 0, dy: 0 }

  return {
    x: clamp(organ.touchX + point.dx, 5, 95),
    y: clamp(organ.touchY + clean.bandOffsetY + point.dy, 58, 98),
  }
}

export function createCalibrationExport(calibration) {
  return {
    schema: 'zone1-touch-calibration',
    exportedAt: new Date().toISOString(),
    calibration: sanitizeCalibration(calibration),
  }
}

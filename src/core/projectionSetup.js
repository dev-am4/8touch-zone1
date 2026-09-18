const STORAGE_KEY = 'zone1-projection-setup-v1'

export const DEFAULT_PROJECTION = {
  version: 1,
  bodyX: 50,
  bodyY: 50,
  bodyScale: 1,
  safeArea: {
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  },
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value))

export function sanitizeProjection(input) {
  const source = input && typeof input === 'object' ? input : {}
  const safeArea = source.safeArea && typeof source.safeArea === 'object' ? source.safeArea : {}

  const bodyX = Number(source.bodyX)
  const bodyY = Number(source.bodyY)
  const bodyScale = Number(source.bodyScale)

  return {
    version: 1,
    bodyX: Number.isFinite(bodyX) ? clamp(bodyX, 25, 75) : DEFAULT_PROJECTION.bodyX,
    bodyY: Number.isFinite(bodyY) ? clamp(bodyY, 28, 72) : DEFAULT_PROJECTION.bodyY,
    bodyScale: Number.isFinite(bodyScale) ? clamp(bodyScale, 0.65, 1.35) : DEFAULT_PROJECTION.bodyScale,
    safeArea: {
      top: Number.isFinite(Number(safeArea.top)) ? clamp(Number(safeArea.top), 0, 20) : DEFAULT_PROJECTION.safeArea.top,
      right: Number.isFinite(Number(safeArea.right)) ? clamp(Number(safeArea.right), 0, 20) : DEFAULT_PROJECTION.safeArea.right,
      bottom: Number.isFinite(Number(safeArea.bottom)) ? clamp(Number(safeArea.bottom), 0, 20) : DEFAULT_PROJECTION.safeArea.bottom,
      left: Number.isFinite(Number(safeArea.left)) ? clamp(Number(safeArea.left), 0, 20) : DEFAULT_PROJECTION.safeArea.left,
    },
  }
}

export function loadProjectionSetup() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? sanitizeProjection(JSON.parse(raw)) : { ...DEFAULT_PROJECTION, safeArea: { ...DEFAULT_PROJECTION.safeArea } }
  } catch {
    return { ...DEFAULT_PROJECTION, safeArea: { ...DEFAULT_PROJECTION.safeArea } }
  }
}

export function saveProjectionSetup(projection) {
  const clean = sanitizeProjection(projection)
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(clean))
  return clean
}

export function resetProjectionSetup() {
  window.localStorage.removeItem(STORAGE_KEY)
  return { ...DEFAULT_PROJECTION, safeArea: { ...DEFAULT_PROJECTION.safeArea } }
}

export function projectionBodyStyle(projection) {
  const clean = sanitizeProjection(projection)
  return {
    '--body-x': clean.bodyX + '%',
    '--body-y': clean.bodyY + '%',
    '--body-scale': clean.bodyScale,
  }
}

export function safeAreaStyle(projection) {
  const clean = sanitizeProjection(projection)
  return {
    '--safe-top': clean.safeArea.top + '%',
    '--safe-right': clean.safeArea.right + '%',
    '--safe-bottom': clean.safeArea.bottom + '%',
    '--safe-left': clean.safeArea.left + '%',
  }
}

export function createProjectionExport(projection) {
  return {
    schema: 'zone1-projection-setup',
    exportedAt: new Date().toISOString(),
    projection: sanitizeProjection(projection),
  }
}

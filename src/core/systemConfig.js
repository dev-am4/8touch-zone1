import { sanitizeCalibration } from './calibration'
import { sanitizeProjection } from './projectionSetup'

export const SYSTEM_CONFIG_SCHEMA = 'zone1-system-config'
export const SYSTEM_CONFIG_VERSION = 1

export function createSystemConfig({ calibration, projection }) {
  return {
    schema: SYSTEM_CONFIG_SCHEMA,
    version: SYSTEM_CONFIG_VERSION,
    exportedAt: new Date().toISOString(),
    exhibit: {
      id: '8touch-zone1',
      mode: 'prototype',
      touchModel: 'dual-zone-universal-reach',
    },
    projection: sanitizeProjection(projection),
    calibration: sanitizeCalibration(calibration),
    sensor: {
      eventName: 'zone1:touch',
      acceptedCoordinates: ['normalized-0-1', 'screen-pixel'],
      primaryInput: 'universal-reach',
      secondaryInput: 'anatomical',
    },
    kiosk: {
      shell: 'electron',
      mediaMode: 'local-video',
      mediaIncluded: false,
      internetRequired: false,
    },
  }
}

export function parseSystemConfig(source) {
  const parsed = typeof source === 'string' ? JSON.parse(source) : source

  if (!parsed || parsed.schema !== SYSTEM_CONFIG_SCHEMA) {
    throw new Error('ไฟล์นี้ไม่ใช่ Zone 1 System Config')
  }

  return {
    projection: sanitizeProjection(parsed.projection),
    calibration: sanitizeCalibration(parsed.calibration),
  }
}

export function downloadSystemConfig(config) {
  const blob = new Blob([JSON.stringify(config, null, 2)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'zone1-system-config.json'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

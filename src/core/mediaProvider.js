/**
 * Media contract.
 *
 * Browser/Vercel stays in prototype mode and never requests heavy media.
 * Electron resolves files from the local kiosk media directory through the
 * zone1-media:// custom protocol registered by electron/main.cjs.
 */

export function createPrototypeMediaProvider() {
  return {
    mode: 'prototype',
    hasMedia: () => false,
    getIdle: () => null,
    getStory: () => null,
  }
}

export function createKioskMediaProvider(resolveLocalAsset) {
  return {
    mode: 'local-video',
    hasMedia: () => true,
    getIdle: () => resolveLocalAsset('idle.mp4'),
    getStory: (organId) => resolveLocalAsset(organId + '.mp4'),
  }
}

export function createRuntimeMediaProvider() {
  if (typeof window !== 'undefined' && window.zone1Kiosk?.isElectron) {
    return createKioskMediaProvider((filename) => {
      const encoded = encodeURIComponent(filename)
      return 'zone1-media://asset/' + encoded
    })
  }

  return createPrototypeMediaProvider()
}

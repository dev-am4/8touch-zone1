/**
 * Media contract
 *
 * Web/Vercel currently runs in prototype mode and must never request real videos.
 * When the kiosk phase starts, Electron can provide local file URLs through the same
 * contract without changing the interaction/state-machine layer.
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

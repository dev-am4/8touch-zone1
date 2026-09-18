export const EXHIBIT_CONFIG = {
  appMode: 'prototype',
  title: 'สำรวจร่างกายของคุณ',
  subtitle: 'สุขภาพดีเกิดขึ้นเมื่อทุกระบบทำงานร่วมกัน',
  idleHint: 'แตะจุดด้านล่างเพื่อเลือกอวัยวะ',
  storyDurationMs: 12000,
  returnDelayMs: 900,
  playback: {
    transitionMs: 320,
    masterFps: 30,
    transitionHandleFrames: 12,
    homeFrameSeconds: 0,
    restartIdleAtHomeFrame: true,
    latestIntentWins: true,
    sameTouchCancels: true,
    storyEndReturnsIdle: true,
  },
  visitorUi: {
    mode: 'video-first',
    labelsInWebPreview: true,
    labelsInKiosk: false,
    backGraphicInWebPreview: true,
    backGraphicInKiosk: false,
    note: 'Final visitor visuals are baked into the videos. Runtime UI remains a transparent touch layer except in debug/operator modes.',
  },
  touchCooldownMs: 450,
  sensorEventName: 'zone1:touch',

  touchLayout: {
    mode: 'dual-zone-universal-reach',
    backTarget: {
      x: 4,
      y: 84,
      width: 18,
      height: 11,
      note: 'Screen-space back target in lower-left universal reach area while a story is active.',
    },
    accessTouchRadius: 11,
    anatomicalTouchRadius: 7,
    accessBandY: { min: 76, max: 94 },
    note: 'Final physical height must be calibrated on site from finished floor level so children, wheelchair users, and standing adults can all reach the access band.',
  },

  projection: {
    designWidth: 1920,
    designHeight: 1080,
    bodyMapWidthVw: 48,
    bodyMapMaxHeightVh: 68,
  },

  kiosk: {
    mediaMode: 'local-video',
    mediaRoot: 'media',
    autoplay: true,
    allowInternet: false,
  },
}

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
    note: 'Final visitor visuals are baked into the videos. Runtime UI remains exactly eight transparent touch points except in debug/operator modes.',
  },
  touchCooldownMs: 450,
  sensorEventName: 'zone1:touch',

  touchLayout: {
    mode: 'eight-fixed-points',
    accessTouchRadius: 11,
    accessBandY: { min: 76, max: 94 },
    note: 'There are exactly eight visitor touch points. Each point controls its own story; touching the active point again returns to Main.',
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

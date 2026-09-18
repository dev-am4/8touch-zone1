export const EXHIBIT_CONFIG = {
  appMode: 'prototype',
  title: 'สำรวจร่างกายของคุณ',
  subtitle: 'สุขภาพดีเกิดขึ้นเมื่อทุกระบบทำงานร่วมกัน',
  idleHint: 'แตะอวัยวะเพื่อสำรวจ',
  storyDurationMs: 12000,
  returnDelayMs: 900,
  touchCooldownMs: 450,
  sensorEventName: 'zone1:touch',
  touchRadius: 11,
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

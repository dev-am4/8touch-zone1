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
    labelsInWebPreview: false,
    labelsInKiosk: false,
    attractIntervalMs: 5200,
    attractMessages: [
      'สมองควบคุมการคิด ความจำ การเคลื่อนไหว และอารมณ์หลายด้านของร่างกาย',
      'ช่องปากเป็นจุดเริ่มต้นของการย่อยอาหาร ทั้งจากการบดเคี้ยวและการทำงานของน้ำลาย',
      'ปอดแลกเปลี่ยนออกซิเจนเข้าสู่เลือด และช่วยขับคาร์บอนไดออกไซด์ออกจากร่างกาย',
      'หัวใจสูบฉีดเลือดเพื่อนำออกซิเจนและสารอาหารไปยังส่วนต่าง ๆ ของร่างกาย',
      'ไตช่วยกรองของเสีย และรักษาสมดุลของน้ำกับเกลือแร่ภายในร่างกาย',
      'กล้ามเนื้อและกระดูกทำงานร่วมกัน เพื่อให้ร่างกายเคลื่อนไหว ทรงตัว และพยุงร่างกาย',
    ],
    note: 'Final visitor visuals are baked into the videos. Runtime UI remains exactly eight transparent touch points plus one short rotating attract line while idle.',
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

  previewMedia: {
    idleSrc: '/media/idle.mp4',
    muted: true,
    note: 'Web preview uses idle.mp4 when present. Electron kiosk still reads media from the local SSD media folder.',
  },

  kiosk: {
    mediaMode: 'local-video',
    mediaRoot: 'media',
    autoplay: true,
    allowInternet: false,
  },
}

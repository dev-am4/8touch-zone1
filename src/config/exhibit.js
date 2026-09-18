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
      'สมองช่วยให้เราคิด จดจำ และควบคุมอารมณ์ ลองแตะที่สมองเพื่อดูว่ามันทำงานอย่างไร',
      'ช่องปากเริ่มต้นการย่อยอาหารตั้งแต่คำแรกที่เราเคี้ยว ลองแตะเพื่อสำรวจเส้นทางของอาหาร',
      'ปอดนำออกซิเจนเข้าสู่ร่างกายทุกครั้งที่เราหายใจ ลองแตะที่ปอดเพื่อดูการทำงานภายใน',
      'หัวใจสูบฉีดเลือดไปเลี้ยงทั่วร่างกายตลอดเวลา ลองแตะที่หัวใจเพื่อดูจังหวะการทำงาน',
      'ไตช่วยกรองของเสียและรักษาสมดุลน้ำในร่างกาย ลองแตะที่ไตเพื่อดูว่าร่างกายรักษาสมดุลอย่างไร',
      'กล้ามเนื้อและกระดูกทำงานร่วมกันทุกครั้งที่เราขยับ ลองแตะเพื่อดูว่าร่างกายเคลื่อนไหวได้อย่างไร',
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

# 8touch-zone1

Interactive Projection Prototype สำหรับโซน 1 “สุขภาพสำคัญอย่างไร” — 8 จุดสัมผัส

## สถานะปัจจุบัน

ตอนนี้โปรเจกต์อยู่ในระยะ **Structure / Interaction Prototype**

ยัง **ไม่ใส่วิดีโอจริง** และ Web Preview จะไม่พยายามโหลด MP4 ใด ๆ

เป้าหมายของระยะนี้คือวางระบบให้พร้อมก่อน:
- State flow
- 8 touch points
- Universal Reach Zone สำหรับเด็ก ผู้ใหญ่ และผู้ใช้รถเข็น
- Sensor coordinate mapping
- Projection safe area
- Calibration
- Operator workflow
- การสลับเรื่องระหว่างกำลังเล่น
- การกลับ Idle
- โครง Media Provider สำหรับ Kiosk ในอนาคต

## Flow

```text
BOOT
  ↓
IDLE
  ↓ แตะอวัยวะ
STORY
  ├─ แตะอวัยวะอื่น → เปลี่ยน STORY ทันที
  └─ หมดเวลา → IDLE
```

ใน Web Preview หน้า STORY ใช้ Prototype Scene เพื่อดูจังหวะและ UX เท่านั้น

ตอนทำ Kiosk จริง จะเปลี่ยน Presentation Layer เป็น Local Video โดยไม่ต้องรื้อ Touch Engine หรือ State Machine

## โครงสร้างหลัก

```text
src/
├── App.jsx
├── config/
│   └── exhibit.js
├── data/
│   └── organs.js
├── core/
│   ├── touchEngine.js
│   └── mediaProvider.js
├── components/
│   ├── BodyMap.jsx
│   ├── PrototypeScene.jsx
│   └── OperatorPanel.jsx
├── main.jsx
└── styles.css

electron/
├── main.cjs
└── preload.cjs

docs/
├── ARCHITECTURE.md
└── KIOSK_MEDIA_PLAN.md
```

## หลักการจุดแตะทุกวัย

แต่ละเรื่องมี 2 ตำแหน่ง interaction:
- จุดอวัยวะบนร่างกาย สำหรับการแตะตรงแบบ intuitive
- จุดแตะขนาดใหญ่ใน Universal Reach Zone ด้านล่าง สำหรับผู้ชมทุกช่วงวัยและช่วงเอื้อม

ทั้งสองตำแหน่งเรียกเรื่องเดียวกัน จึงไม่ต้องบังคับเด็กหรือผู้ใช้รถเข็นให้เอื้อมถึงตำแหน่งสมอง/ช่องปากที่อยู่สูงบนภาพ

ตอนติดตั้งจริงต้องวัดระดับจากพื้นสำเร็จและ Calibration ตำแหน่งแถบ Universal Reach ให้สัมพันธ์กับความสูงพื้นที่ฉายจริง

## 8 จุดสัมผัส

1. สมอง → โซน 3 ฐานใจสุข กายสุข
2. ช่องปาก + ฟัน → โซน 2 My Body
3. ปอด → โซน 4 สารพิษสะกิดโรค
4. หัวใจ → โซน 5 Fitness for Health
5. ตับ → โซน 4 สารพิษสะกิดโรค
6. ไต → โซน 3 Food and Fit
7. กระเพาะ + ลำไส้ → โซน 3 Food and Fit
8. กล้ามเนื้อ + กระดูก → โซน 5 Fitness for Health

## Development

```bash
npm install
npm run dev
```

## Operator

- F8 — Touch Area / Calibration Overlay
- F9 — Operator Panel
- Ctrl + Shift + I — กลับ Idle
- Ctrl + Shift + Q — ออกจาก Electron Kiosk
- Double click มุมซ้ายบน — เปิด Operator Panel สำรอง

## Sensor

รองรับทั้ง:
- Mouse / Windows Touch
- normalized coordinate 0–1
- screen pixel coordinate

External middleware ส่ง:

```js
window.dispatchEvent(
  new CustomEvent('zone1:touch', {
    detail: { x: 0.56, y: 0.39 }
  })
)
```

Touch Engine จะ map จาก screen coordinate เข้า Body Map coordinate ก่อน hit-test

## Kiosk / Video

วิดีโอจริงจะถูกใส่ตอนทำ Kiosk เท่านั้น

แนวทางคือ:
- media อยู่ Local SSD
- ไม่เก็บ media จริงใน Web Preview
- ไม่ต้อง upload media ไป Vercel
- Media Provider เป็นตัวเชื่อม State Machine กับไฟล์จริง
- เปลี่ยนวิดีโอภายหลังได้โดยไม่ต้องรื้อ interaction layer

ดูรายละเอียด:
- `docs/ARCHITECTURE.md`
- `docs/KIOSK_MEDIA_PLAN.md`

## Deploy policy

Vercel Git auto deploy ถูกปิดไว้ใน `vercel.json` เพื่อไม่ให้ทุก commit ระหว่างวางโครงสร้างสร้าง deployment ใหม่

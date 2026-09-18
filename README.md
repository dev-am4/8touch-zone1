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

- F6 — Projection Setup: Grid / Safe Area / ตำแหน่งและขนาด Body Map / Export JSON
- F7 — Calibration Mode: ลาก Universal Reach Zone ทั้งชุด / ปรับแต่ละจุด / Export JSON
- F8 — Touch Area Debug Overlay
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


## Calibration Mode

กด `F7` เพื่อเข้า Setup Mode

ทำได้โดยไม่แก้โค้ด:
- ลากกรอบ Universal Reach Zone เพื่อเลื่อน 8 จุดขึ้น/ลงพร้อมกัน
- ลากแต่ละจุดแยกซ้าย/ขวา/ขึ้น/ลง
- เลือกจุดแล้วใช้ปุ่มลูกศรสำหรับ fine adjustment ทีละ 0.5%
- ค่าบันทึกใน `localStorage` ของเครื่องอัตโนมัติ
- Export ค่าเป็น `zone1-calibration.json`
- Reset กลับค่าออกแบบเริ่มต้นได้

ค่า Calibration จะถูกใช้ทั้งตำแหน่งปุ่มบน UI และ Sensor hit-test จึงไม่มีกรณีภาพขยับแต่จุดตรวจ Sensor ยังอยู่ตำแหน่งเดิม

ก่อนส่งมอบต้องวัดจาก Finished Floor Level และให้กลุ่มทดสอบต่างช่วงความสูง รวมถึงผู้ใช้รถเข็น ทดลองแตะครบทั้ง 8 จุด


## Projection Setup Mode

กด `F6` เพื่อเข้า Projection Setup ก่อนทำ Touch Calibration

สามารถ:
- เปิด Grid และเส้นกึ่งกลางจอ
- กำหนด Safe Area แยก Top / Right / Bottom / Left
- ลาก Body Map ทั้งชุดเพื่อเลื่อนตำแหน่ง X/Y
- ลากมุมขวาล่างเพื่อ Scale ร่างกาย
- ปรับละเอียด X/Y ทีละ 0.5%
- ปรับ Scale ทีละ 0.02
- บันทึกค่าใน `localStorage` อัตโนมัติ
- Export เป็น `zone1-projection-setup.json`
- Reset กลับค่าเริ่มต้น

Body Map ที่เห็นใน Idle, Invisible Touch Layer ระหว่าง Story และ Calibration Mode ใช้ Projection Setup ค่าเดียวกันทั้งหมด

ลำดับติดตั้งที่ตั้งใจใช้:

```text
Projector Warp / Blend
        ↓
F6 Projection Setup
        ↓
F7 Touch Calibration
        ↓
F8 Touch Debug / QC
        ↓
ทดสอบเด็ก + ผู้ใหญ่ + ผู้ใช้รถเข็น
        ↓
Lock Configuration
```


## Operator Setup V2

กด `F9` เพื่อเปิด Setup Console ที่รวมสถานะระบบสำคัญไว้หน้าเดียว:

- Projection — ตำแหน่ง X/Y และ Scale ปัจจุบัน
- Touch — Universal Reach calibration และ 8 จุด
- Sensor — WAITING จนกว่าจะได้รับ event `zone1:touch` แล้วเปลี่ยนเป็น EVENT RECEIVED
- Kiosk — แยก Web Preview กับ Electron runtime
- Media — แสดง KIOSK PHASE เพราะยังไม่โหลดวิดีโอจริงใน Web Preview

### Unified configuration

ปุ่ม `Export All Config` จะรวม Projection + Touch Calibration + Sensor contract + Kiosk metadata เป็นไฟล์เดียว:

`zone1-system-config.json`

เครื่องหน้างานสามารถกด `Import Config` เพื่อโหลด Projection และ Touch Calibration จากเครื่องทดสอบ แล้วบันทึกลง localStorage ของเครื่องนั้นทันที

ดังนั้น workflow ย้ายค่าเป็น:

```text
เครื่องทดสอบ
F6 + F7 ปรับจนผ่าน
      ↓
Export All Config
      ↓
zone1-system-config.json
      ↓
เครื่อง Kiosk หน้างาน
F9 → Import Config
      ↓
ตรวจ F6 / F7 / F8
      ↓
Final QC
```


## Story Back Touch

เมื่ออยู่ในหน้า Story มีปุ่ม `กลับ / หน้าหลัก` ขนาดใหญ่ในโซนล่างซ้ายสำหรับผู้ชมทุกวัย

รองรับทั้ง:
- แตะปุ่มบนจอโดยตรง
- Mouse / Windows Touch
- External Sensor ที่ส่ง `zone1:touch`

Sensor จะตรวจพื้นที่ Back ก่อนตรวจจุดอวัยวะ ถ้าแตะ Back จะ:
1. หยุด Story timer
2. กลับ state `IDLE`
3. ล้าง active organ
4. พร้อมให้ผู้ชมคนถัดไปเลือกใหม่ทันที

กด `F8` จะเห็นกรอบ `BACK TOUCH AREA` สำหรับตรวจตำแหน่งหน้างาน


## Media Playback Engine V1

Playback flow สำหรับ Kiosk ถูกเตรียมแล้ว:

- Main `idle.mp4` loop
- แตะอวัยวะ → preload clip ใน hidden buffer → crossfade
- video จบ → กลับ Main ด้วย `ended` event
- แตะอวัยวะเดิมซ้ำ → cancel → Main
- แตะอวัยวะอื่น → เปลี่ยน clip ทันที
- rapid touch ใช้ latest intent wins
- ภาพและเสียง fade พร้อมกัน
- ระหว่าง Story ยังมี Universal Reach controls ให้เลือกเรื่องอื่น
- Electron อ่าน media จาก local SSD ผ่าน `zone1-media://`
- F9 ตรวจ media inventory ว่าครบ 9/9

Vercel ยังเป็น Preview และไม่โหลดวิดีโอจริง

# Zone 1 Architecture

## เป้าหมายตอนนี้

ระยะนี้เป็น **Structure / Interaction Prototype** เท่านั้น

สิ่งที่ต้องล็อกให้ได้ก่อนทำวิดีโอ:
1. State flow
2. ตำแหน่ง 8 จุดแตะ
3. Coordinate system ของ Sensor
4. Projection safe area
5. Operator / Calibration flow
6. วิธีสลับเรื่องระหว่างกำลังเล่น
7. Recovery / Idle behavior

เว็บ Preview ต้องไม่โหลดไฟล์วิดีโอจริง

## State machine

```text
BOOT
  ↓
IDLE
  ├─ touch organ A → STORY(A)
  └─ operator test → STORY(x)

STORY(A)
  ├─ touch organ B → STORY(B)
  ├─ story timeout → IDLE
  └─ operator idle → IDLE
```

เมื่อเป็น Kiosk จริง STORY จะยังเป็น state เดิม แต่ Presentation Layer จะเปลี่ยนจาก PrototypeScene เป็น LocalVideoScene

## Layers

```text
App / State Machine
│
├── Exhibit Config
├── Organ Content Data
├── Touch Engine
├── Media Provider Contract
│   ├── Prototype Provider  ← ใช้ตอนนี้
│   └── Kiosk Local Provider ← ทำตอน Kiosk
│
├── Presentation
│   ├── Idle Body Map
│   ├── Prototype Story
│   └── Operator Panel
│
└── Platform
    ├── Browser / Vercel Preview
    └── Electron Kiosk
```

## Coordinate policy

ตำแหน่งอวัยวะเก็บเป็นเปอร์เซ็นต์ 0–100 ภายใน Body Map ไม่ผูกกับ pixel ของจอ

Sensor สามารถส่ง:
- normalized screen coordinate 0–1
- pixel coordinate ของจอ

Touch Engine จะแปลงค่าจาก screen → body map local coordinate ก่อน hit-test

ดังนั้นสามารถเปลี่ยน resolution / aspect ratio / projector mapping ได้โดยไม่ต้องแก้ข้อมูลอวัยวะทั้งหมด

## Calibration

- F8 = แสดง Touch Area
- F9 = Operator Panel
- Ctrl+Shift+I = กลับ Idle
- Ctrl+Shift+Q = ออกจาก Electron Kiosk

หลังติดตั้ง Projector ต้องทำ Calibration หลัง Warp/Mapping เสร็จแล้ว

## สิ่งที่ยังไม่ทำในระยะนี้

- ไม่มี MP4 จริง
- ไม่มีเสียงจริง
- ไม่มี preload media
- ไม่มี path media บน Vercel
- ยังไม่ล็อก codec / bitrate
- ยังไม่ผูก sensor hardware รุ่นจริง

ทั้งหมดนี้จะทำใน Kiosk Integration phase หลัง layout และ touch geometry ผ่าน

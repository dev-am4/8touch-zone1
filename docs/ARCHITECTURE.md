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

## Universal reach policy

ทุกอวัยวะมีพิกัด 2 ชุด:

- `anchorX / anchorY` = ตำแหน่งอวัยวะจริงบนภาพร่างกาย
- `touchX / touchY` = จุดแตะหลักใน Universal Reach Zone ด้านล่าง

จุดแตะหลักจัดเป็น 2 แถว × 4 จุดในช่วงล่างของพื้นที่ interaction เพื่อให้ไม่จำเป็นต้องเอื้อมไปแตะสมองหรืออวัยวะที่อยู่สูงบนภาพโดยตรง

ระบบยังคงมี anatomical hit area เป็นทางเลือกที่สอง ดังนั้นผู้ชมที่เอื้อมถึงสามารถแตะตำแหน่งอวัยวะบนภาพได้ ส่วนเด็ก ผู้ใช้รถเข็น และผู้ชมที่มีช่วงเอื้อมสั้นกว่าสามารถใช้ Universal Reach Zone ได้ครบทั้ง 8 เรื่อง

ความสูงจริงจากพื้น **ยังไม่ hard-code ในซอฟต์แวร์** เพราะขึ้นกับขนาดผนัง ตำแหน่ง projector และพื้นที่ติดตั้งจริง ต้องวัดจาก Finished Floor Level ตอน Calibration หน้างาน แล้วขยับ interaction band ให้ทุกกลุ่มเป้าหมายเอื้อมถึงทุกจุด

## Coordinate policy

ตำแหน่งทั้งหมดเก็บเป็นเปอร์เซ็นต์ 0–100 ภายใน Body Map ไม่ผูกกับ pixel ของจอ

Sensor สามารถส่ง:
- normalized screen coordinate 0–1
- pixel coordinate ของจอ

Touch Engine จะแปลงค่าจาก screen → body map local coordinate ก่อน hit-test

ดังนั้นสามารถเปลี่ยน resolution / aspect ratio / projector mapping ได้โดยไม่ต้องแก้ข้อมูลอวัยวะทั้งหมด

## Projection setup

- F6 = Projection Setup Mode
- Grid แบ่งพื้นที่ฉายและมีเส้นกึ่งกลาง
- Safe Area ตั้งค่า margin แยก 4 ด้าน
- Body Map มี `bodyX / bodyY / bodyScale`
- ลากตำแหน่งและปรับ Scale ได้โดยไม่แก้โค้ด
- ค่าถูกเก็บใน localStorage และ Export JSON ได้
- Body Map, Calibration Overlay และ Touch Layer ใช้ transform ชุดเดียวกัน

ต้องทำ Projection Setup หลัง Warp/Blend ของ Projector เพราะตำแหน่งภาพจริงหลัง mapping เป็น reference ที่ Sensor ต้องอิง

## Calibration

- F7 = Calibration Mode
- F8 = แสดง Touch Area
- F9 = Operator Panel
- Ctrl+Shift+I = กลับ Idle
- Ctrl+Shift+Q = ออกจาก Electron Kiosk

Calibration Mode มี 2 ระดับ:

1. `bandOffsetY` — เลื่อน Universal Reach Zone ทั้งชุดในแนวตั้ง
2. `points[organ].dx / dy` — ปรับจุดใดจุดหนึ่งแยกจากตำแหน่งฐาน

ค่าถูก sanitize และเก็บใน localStorage ของเครื่อง Preview/Kiosk และสามารถ Export เป็น JSON สำหรับบันทึกค่าหน้างาน

ทั้ง Rendering และ Sensor Hit Test ใช้ resolver ชุดเดียวกัน ดังนั้นค่าที่เห็นบนจอและค่าที่ Sensor ตรวจจะตรงกัน

ลำดับหน้างานคือ Warp/Blend → F6 Projection Setup → F7 Touch Calibration → F8 Debug/QC

หลังติดตั้ง Projector ต้องทำ Calibration หลัง Warp/Mapping เสร็จแล้ว และต้องทดสอบจาก Finished Floor Level กับผู้ใช้หลายช่วงความสูงก่อนล็อกค่า

## สิ่งที่ยังไม่ทำในระยะนี้

- ไม่มี MP4 จริง
- ไม่มีเสียงจริง
- ไม่มี preload media
- ไม่มี path media บน Vercel
- ยังไม่ล็อก codec / bitrate
- ยังไม่ผูก sensor hardware รุ่นจริง

ทั้งหมดนี้จะทำใน Kiosk Integration phase หลัง layout และ touch geometry ผ่าน
